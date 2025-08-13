import { QueryRunner } from 'typeorm';
import { IUserPaymentUnitOfWork } from '../../../../../user/application/interfaces/user-payment-uow.interface';
import { IPaymentRepo } from '../../../../../user/application/repositories/payment.repository';
import { IUpdateUserRepo } from '../../../../../user/application/repositories/user.repository';
import { TypeOrmPaymentRepository } from '../repositories/typeorm-payment.repository';
import { TypeOrmUserRepository } from '../repositories/typeorm-user.repository';

enum TransactionState {
  NotStarted,
  Active,
  PendingCommit,
  Committed,
  RolledBack,
  Failed,
}

interface OperationTracker {
  id: string;
  repository: string;
  method: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: Date;
}

export class TypeORMUserPaymentUnitOfWork implements IUserPaymentUnitOfWork {
  public readonly users: IUpdateUserRepo;
  public readonly payments: IPaymentRepo;

  private state = TransactionState.NotStarted;
  private operations: Map<string, OperationTracker> = new Map();
  private completedOperations = 0;
  private failedOperations = 0;
  private pendingOperations = 0;

  // Transaction completion detection
  private expectedOperations?: number;
  private autoCommitTimeout?: NodeJS.Timeout;
  private readonly AUTO_COMMIT_DELAY = 100; // ms

  constructor(private readonly queryRunner: QueryRunner) {
    const manager = queryRunner.manager;

    this.users = this.wrapRepository(
      'users',
      new TypeOrmUserRepository(manager),
    );
    this.payments = this.wrapRepository(
      'payments',
      new TypeOrmPaymentRepository(manager),
    );
  }

  private wrapRepository<T extends IUpdateUserRepo | IPaymentRepo>(
    repoName: string,
    repository: T,
  ): T {
    return new Proxy(repository, {
      get: (target, prop, receiver) => {
        const originalMethod = target[prop as keyof T];

        // Only intercept methods (functions)
        if (typeof originalMethod !== 'function') {
          return originalMethod;
        }

        const methodName = prop as string;

        // Only track write operations that affect transaction state
        if (this.isWriteOperation(methodName)) {
          return this.createTrackedMethod(
            repoName,
            methodName,
            originalMethod,
            target,
          );
        }

        // Read operations pass through without tracking
        return originalMethod.bind(target);
      },
    });
  }

  /**
   * Creates a tracked version of a repository method
   */
  private createTrackedMethod(
    repoName: string,
    methodName: string,
    originalMethod: Function,
    target: any,
  ): Function {
    return async (...args: any[]) => {
      const operationId = this.generateOperationId(repoName, methodName);

      // Start tracking this operation
      this.startOperation(operationId, repoName, methodName);

      try {
        // Execute the original method
        const result = await originalMethod.apply(target, args);

        // Mark operation as completed
        this.completeOperation(operationId);

        // Check if transaction should auto-commit
        await this.checkAutoCommit();

        return result;
      } catch (error) {
        // Mark operation as failed
        this.failOperation(operationId, error);

        // Trigger auto-rollback
        await this.autoRollback();

        throw error;
      }
    };
  }

  /**
   * Determines if a method is a write operation that should be tracked
   */
  private isWriteOperation(methodName: string): boolean {
    const writeOperations = [
      'save',
      'create',
      'update',
      'delete',
      'remove',
      'insert',
      'upsert',
      'softDelete',
      'restore',
    ];

    return writeOperations.some((op) =>
      methodName.toLowerCase().includes(op.toLowerCase()),
    );
  }

  /**
   * Generates unique operation ID
   */
  private generateOperationId(repoName: string, methodName: string): string {
    return `${repoName}.${methodName}.${Date.now()}.${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Starts tracking an operation
   */
  private startOperation(
    operationId: string,
    repository: string,
    method: string,
  ): void {
    this.operations.set(operationId, {
      id: operationId,
      repository,
      method,
      status: 'pending',
      timestamp: new Date(),
    });

    this.pendingOperations++;

    console.log(`🟡 Started operation: ${operationId}`);
  }

  /**
   * Marks operation as completed
   */
  private completeOperation(operationId: string): void {
    const operation = this.operations.get(operationId);
    if (operation) {
      operation.status = 'completed';
      this.completedOperations++;
      this.pendingOperations--;

      console.log(`✅ Completed operation: ${operationId}`);
    }
  }

  /**
   * Marks operation as failed
   */
  private failOperation(operationId: string, error: any): void {
    const operation = this.operations.get(operationId);
    if (operation) {
      operation.status = 'failed';
      this.failedOperations++;
      this.pendingOperations--;

      console.log(`❌ Failed operation: ${operationId}`, error.message);
    }
  }

  /**
   * EXTENDED: Smart auto-commit detection with multiple strategies
   */
  private async checkAutoCommit(): Promise<void> {
    if (this.state !== TransactionState.Active) {
      return;
    }

    console.log(
      `📊 Transaction State: ${this.completedOperations} completed, ${this.pendingOperations} pending, ${this.failedOperations} failed`,
    );

    // Strategy 1: No pending operations (immediate check)
    if (this.pendingOperations === 0 && this.completedOperations > 0) {
      console.log('🎯 Strategy 1: No pending operations detected');
      await this.triggerAutoCommit('no-pending-operations');
      return;
    }

    // Strategy 2: Expected operations reached
    if (
      this.expectedOperations &&
      this.completedOperations >= this.expectedOperations
    ) {
      console.log(
        `🎯 Strategy 2: Expected operations (${this.expectedOperations}) reached`,
      );
      await this.triggerAutoCommit('expected-operations-reached');
      return;
    }

    // Strategy 3: Timeout-based commit (debounced)
    // this.setupTimeoutCommit();

    // Strategy 4: Pattern-based detection
    // if (this.isTransactionPatternComplete()) {
    //   console.log('🎯 Strategy 4: Transaction pattern complete');
    //   await this.triggerAutoCommit('pattern-complete');
    //   return;
    // }
  }

  /**
   * Sets up timeout-based commit (debounced approach)
   */
  private setupTimeoutCommit(): void {
    // Clear existing timeout
    if (this.autoCommitTimeout) {
      clearTimeout(this.autoCommitTimeout);
    }

    // Set new timeout - commits if no new operations start
    this.autoCommitTimeout = setTimeout(async () => {
      if (
        this.state === TransactionState.Active &&
        this.pendingOperations === 0 &&
        this.completedOperations > 0
      ) {
        console.log('🎯 Strategy 3: Timeout-based commit triggered');
        await this.triggerAutoCommit('timeout');
      }
    }, this.AUTO_COMMIT_DELAY);
  }

  /**
   * Detects common transaction patterns to determine completion
   */
  private isTransactionPatternComplete(): boolean {
    const repoOperations = this.getOperationsByRepository();

    // Pattern 1: User creation pattern (User + Address + Payment)
    if (this.hasUserCreationPattern(repoOperations)) {
      return true;
    }

    // Pattern 2: Update pattern (multiple updates on same entities)
    if (this.hasUpdatePattern(repoOperations)) {
      return true;
    }

    // Pattern 3: Bulk operation pattern
    if (this.hasBulkOperationPattern(repoOperations)) {
      return true;
    }

    return false;
  }

  /**
   * Groups operations by repository for pattern analysis
   */
  private getOperationsByRepository(): Map<string, OperationTracker[]> {
    const grouped = new Map<string, OperationTracker[]>();

    this.operations.forEach((operation) => {
      if (operation.status === 'completed') {
        const existing = grouped.get(operation.repository) || [];
        existing.push(operation);
        grouped.set(operation.repository, existing);
      }
    });

    return grouped;
  }

  /**
   * Detects user creation pattern: User + Address + Payment
   */
  private hasUserCreationPattern(
    repoOperations: Map<string, OperationTracker[]>,
  ): boolean {
    const userOps = repoOperations.get('users') || [];
    const addressOps = repoOperations.get('addresses') || [];
    const paymentOps = repoOperations.get('payments') || [];

    // Check if we have creation operations on all three repositories
    const hasUserCreate = userOps.some(
      (op) =>
        op.method.toLowerCase().includes('create') ||
        op.method.toLowerCase().includes('save'),
    );
    const hasAddressCreate = addressOps.some(
      (op) =>
        op.method.toLowerCase().includes('create') ||
        op.method.toLowerCase().includes('save'),
    );
    const hasPaymentCreate = paymentOps.some(
      (op) =>
        op.method.toLowerCase().includes('create') ||
        op.method.toLowerCase().includes('save'),
    );

    return hasUserCreate && hasAddressCreate && hasPaymentCreate;
  }

  /**
   * Detects update pattern: Multiple updates on related entities
   */
  private hasUpdatePattern(
    repoOperations: Map<string, OperationTracker[]>,
  ): boolean {
    // Check if we have updates across multiple repositories
    const reposWithUpdates = Array.from(repoOperations.entries()).filter(
      ([repo, ops]) =>
        ops.some((op) => op.method.toLowerCase().includes('update')),
    ).length;

    return reposWithUpdates >= 2;
  }

  /**
   * Detects bulk operation pattern
   */
  private hasBulkOperationPattern(
    repoOperations: Map<string, OperationTracker[]>,
  ): boolean {
    // Check if any repository has multiple operations (bulk)
    return Array.from(repoOperations.values()).some((ops) => ops.length > 2);
  }

  /**
   * Triggers auto-commit with reason logging
   */
  private async triggerAutoCommit(reason: string): Promise<void> {
    if (this.state === TransactionState.Active) {
      this.state = TransactionState.PendingCommit;

      try {
        console.log(`🚀 Auto-committing transaction (reason: ${reason})`);
        console.log(
          `📈 Final stats: ${this.completedOperations} completed, ${this.failedOperations} failed`,
        );

        await this.queryRunner.commitTransaction();
        this.state = TransactionState.Committed;

        console.log('✅ Transaction committed successfully');
      } catch (error) {
        this.state = TransactionState.Failed;
        console.error('❌ Failed to commit transaction:', error);
        throw error;
      }
    }
  }

  /**
   * Triggers auto-rollback
   */
  private async autoRollback(): Promise<void> {
    if (this.state === TransactionState.Active) {
      this.state = TransactionState.RolledBack;

      try {
        console.log('🔄 Auto-rolling back transaction due to error');
        await this.queryRunner.rollbackTransaction();
        console.log('✅ Transaction rolled back successfully');
      } catch (error) {
        console.error('❌ Failed to rollback transaction:', error);
        this.state = TransactionState.Failed;
      }
    }
  }

  /**
   * Sets expected number of operations for precise completion detection
   */
  setExpectedOperations(count: number): void {
    this.expectedOperations = count;
    console.log(`📋 Expected operations set to: ${count}`);
  }

  /**
   * Gets current transaction state for debugging
   */
  getTransactionState(): {
    state: TransactionState;
    completed: number;
    pending: number;
    failed: number;
    operations: OperationTracker[];
  } {
    return {
      state: this.state,
      completed: this.completedOperations,
      pending: this.pendingOperations,
      failed: this.failedOperations,
      operations: Array.from(this.operations.values()),
    };
  }

  /**
   * Manual finalization (fallback)
   */
  async finalizeTransaction(): Promise<void> {
    if (this.autoCommitTimeout) {
      clearTimeout(this.autoCommitTimeout);
    }

    if (this.failedOperations > 0) {
      await this.autoRollback();
    } else if (
      this.state === TransactionState.Active &&
      this.completedOperations > 0
    ) {
      await this.triggerAutoCommit('manual-finalization');
    }
  }
}
