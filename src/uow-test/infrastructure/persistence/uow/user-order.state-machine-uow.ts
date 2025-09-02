import { QueryRunner, EntityManager, DataSource } from 'typeorm';
import { TypeOrmUserRepository } from '../repos/orm-user.repo';
import { TransactionState, OperationRecord } from './transaction-state';
import { v4 as uuid } from 'uuid';
import { TypeOrmOrderRepository } from '../repos/orm-order.repo';
import {
  IUserRepository,
  IOrderRepository,
} from '../../../application/repositories/repos';
import { Logger } from '@nestjs/common';

export class UserOrderStateMachineUnitOfWork {
  private state: TransactionState = TransactionState.IDLE;
  private queryRunner: QueryRunner | null = null;
  private manager: EntityManager | null = null;
  private repositories = new Map<string, any>();
  private operations = new Map<string, OperationRecord>();
  private commitScheduled = false;
  private transactionId = uuid();
  private initializationPromise: Promise<void> | null = null;
  private expectedWrites: number = 2;
  private completedWrites: number = 0;

  constructor(
    private dataSource: DataSource,
    private options: {
      autoCommitDelay?: number;
      debugMode?: boolean;
    } = {},
  ) {
    this.options.autoCommitDelay = this.options.autoCommitDelay ?? 50; // ms
    this.options.debugMode = this.options.debugMode ?? true;
    Logger.warn('created new instance', 'UOW');
  }

  getUserRepository(): IUserRepository {
    return this.getOrCreateTrackedRepository('user', TypeOrmUserRepository);
  }

  getOrderRepository(): IOrderRepository {
    return this.getOrCreateTrackedRepository('order', TypeOrmOrderRepository);
  }

  private getOrCreateTrackedRepository<T>(
    name: string,
    RepositoryClass: new (manager: EntityManager) => T,
  ): T {
    if (this.repositories.has(name)) {
      return this.repositories.get(name);
    }

    const trackedRepo = new Proxy({} as object, {
      get: (target, prop: string) => {
        return (...args: any[]) => {
          return this.ensureInitializedThen(async () => {
            const repo = new RepositoryClass(this.manager!);
            const method = repo[prop];

            if (typeof method !== 'function') {
              return method;
            }

            const isWrite = this.isWriteOperation(prop);

            const promise = method.apply(repo, args);

            if (promise instanceof Promise) {
              return this.trackOperation(name, prop, isWrite, promise);
            }

            return promise;
          });
        };
      },
    });

    this.repositories.set(name, trackedRepo);
    return trackedRepo as T;
  }

  private async ensureInitializedThen<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === TransactionState.IDLE) {
      await this.initialize();
    } else if (this.initializationPromise) {
      await this.initializationPromise;
    }

    return fn();
  }

  private async initialize(): Promise<void> {
    if (this.state !== TransactionState.IDLE) return;

    this.transitionTo(TransactionState.INITIALIZING);

    // Store the initialization promise to prevent double initialization
    this.initializationPromise = this.doInitialize();

    try {
      await this.initializationPromise;
    } finally {
      this.initializationPromise = null;
    }
  }

  private async doInitialize(): Promise<void> {
    try {
      this.queryRunner = this.dataSource.createQueryRunner();
      await this.queryRunner.connect();
      await this.queryRunner.startTransaction('REPEATABLE READ');
      this.manager = this.queryRunner.manager;

      this.transitionTo(TransactionState.ACTIVE);

      if (this.options.debugMode) {
        console.log(`[Transaction ${this.transactionId}] Started`);
      }
    } catch (error) {
      this.transitionTo(TransactionState.FAILED);
      throw error;
    }
  }

  private trackOperation(
    repository: string,
    method: string,
    isWrite: boolean,
    promise: Promise<any>,
  ): Promise<any> {
    if (this.state === TransactionState.ACTIVE) {
      this.transitionTo(TransactionState.TRACKING);
    }
    const operationId = uuid();
    const operation: OperationRecord = {
      id: operationId,
      repository,
      method,
      type: isWrite ? 'write' : 'read',
      promise,
      status: 'pending',
      startedAt: new Date(),
    };

    this.operations.set(operationId, operation);

    const trackedPromise = promise
      .then((result) => {
        operation.status = 'completed';
        operation.completedAt = new Date();
        // this.onOperationComplete(operationId);
        return result;
      })
      .catch((error) => {
        operation.status = 'failed';
        operation.error = error;
        operation.completedAt = new Date();
        // this.onOperationComplete(operationId);
        throw error;
      })
      .finally(() => {
        if (operation.type === 'write') {
          this.completedWrites++;
        }
        if (this.completedWrites === this.expectedWrites) {
          this.checkForAutoCommit();
        }
      });

    return trackedPromise;
  }

  private onOperationComplete(operationId: string): void {
    // Don't do anything if we're already committing or committed
    if (
      [
        TransactionState.COMMITTING,
        TransactionState.COMMITTED,
        TransactionState.ROLLING_BACK,
        TransactionState.ROLLED_BACK,
        TransactionState.FAILED,
      ].includes(this.state)
    ) {
      return;
    }

    // Schedule a check for auto-commit
    this.scheduleCommitCheck();
  }

  private scheduleCommitCheck(): void {
    if (this.commitScheduled) return;

    this.commitScheduled = true;

    // Use a longer delay to ensure all synchronous operations are tracked
    setTimeout(() => {
      this.checkForAutoCommit();
    }, this.options.autoCommitDelay);
  }

  private async checkForAutoCommit(): Promise<void> {
    this.commitScheduled = false;

    // Only check if we are in tracking state
    if (this.state !== TransactionState.TRACKING) return;

    const pendingOps = this.getPendingOperations();

    if (pendingOps.length > 0) {
      //   this.scheduleCommitCheck();
      return;
    }

    const failedOps = this.getFailedOperations();

    if (failedOps.length > 0) {
      await this.rollback();
    } else if (this.hasWriteOperations()) {
      await this.commit();
    } else {
      //   await this.release();
    }
  }

  private getPendingOperations(): OperationRecord[] {
    return Array.from(this.operations.values()).filter(
      (op) => op.status === 'pending',
    );
  }

  private getFailedOperations(): OperationRecord[] {
    return Array.from(this.operations.values()).filter(
      (op) => op.status === 'failed',
    );
  }

  private hasWriteOperations(): boolean {
    return Array.from(this.operations.values()).some(
      (op) => op.type === 'write',
    );
  }

  private async commit(): Promise<void> {
    if (this.state !== TransactionState.TRACKING) return;

    this.transitionTo(TransactionState.COMMITTING);

    try {
      await this.queryRunner!.commitTransaction();
      this.transitionTo(TransactionState.COMMITTED);

      if (this.options.debugMode) {
        console.log(`[Transaction ${this.transactionId}] Committed`);
      }
    } catch (error) {
      this.transitionTo(TransactionState.FAILED);
      throw error;
    } finally {
      await this.cleanup();
    }
  }

  private async rollback(): Promise<void> {
    if (
      ![TransactionState.ACTIVE, TransactionState.TRACKING].includes(this.state)
    )
      return;

    this.transitionTo(TransactionState.ROLLING_BACK);

    try {
      await this.queryRunner!.rollbackTransaction();
      this.transitionTo(TransactionState.ROLLED_BACK);

      if (this.options.debugMode) {
        console.log(`[Transaction ${this.transactionId}] Rolled back`);
      }
    } catch (error) {
      this.transitionTo(TransactionState.FAILED);
      throw error;
    } finally {
      await this.cleanup();
    }
  }

  private async release(): Promise<void> {
    await this.cleanup();
  }

  private async cleanup(): Promise<void> {
    if (this.queryRunner) {
      await this.queryRunner.release();
      this.queryRunner = null;
    }

    this.manager = null;
    this.operations.clear();
    this.repositories.clear();
  }

  private transitionTo(newState: TransactionState): void {
    // Validate state transition
    if (!this.isValidTransition(this.state, newState)) {
      console.warn(
        `[UoW State] Invalid transition: ${this.state} -> ${newState}`,
      );
      return;
    }

    if (this.options.debugMode) {
      console.log(`[UoW State] ${this.state} -> ${newState}`);
    }

    this.state = newState;
  }

  private isValidTransition(
    from: TransactionState,
    to: TransactionState,
  ): boolean {
    const validTransitions: Record<TransactionState, TransactionState[]> = {
      [TransactionState.IDLE]: [TransactionState.INITIALIZING],
      [TransactionState.INITIALIZING]: [
        TransactionState.ACTIVE,
        TransactionState.FAILED,
      ],
      [TransactionState.ACTIVE]: [
        TransactionState.TRACKING,
        TransactionState.ROLLING_BACK,
      ],
      [TransactionState.TRACKING]: [
        TransactionState.COMMITTING,
        TransactionState.ROLLING_BACK,
      ],
      [TransactionState.COMMITTING]: [
        TransactionState.COMMITTED,
        TransactionState.FAILED,
      ],
      [TransactionState.COMMITTED]: [],
      [TransactionState.ROLLING_BACK]: [
        TransactionState.ROLLED_BACK,
        TransactionState.FAILED,
      ],
      [TransactionState.ROLLED_BACK]: [],
      [TransactionState.FAILED]: [],
    };

    return validTransitions[from]?.includes(to) ?? false;
  }

  private isWriteOperation(method: string): boolean {
    const writeMethods = [
      'save',
      'insert',
      'update',
      'delete',
      'remove',
      'upsert',
      'increment',
      'decrement',
      'softDelete',
      'restore',
    ];
    return writeMethods.includes(method.toLowerCase());
  }
}
