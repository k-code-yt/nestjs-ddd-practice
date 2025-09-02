import { Logger } from '@nestjs/common';
import { EntityManager, DataSource, QueryRunner } from 'typeorm';
import {
  IUserRepository,
  IOrderRepository,
  UserOrderDataAccess,
  UserOrderUOWForModule,
} from '../../../application/repositories/repos';
import { TypeOrmOrderRepository } from '../repos/orm-order.repo';
import { TypeOrmUserRepository } from '../repos/orm-user.repo';
import { v7 } from 'uuid';
import { IsolationLevel } from 'typeorm/driver/types/IsolationLevel';

type IUoWOptions = {
  isolationLevel: IsolationLevel;
  debugMode?: boolean;
};

export class UserOrderUnitOfWorkForModule
  implements UserOrderUOWForModule, UserOrderDataAccess
{
  private userRepository: IUserRepository;
  private orderRepository: IOrderRepository;
  private manager: EntityManager;
  private queryRunner: QueryRunner;
  private id: string;

  constructor(
    dataSource: DataSource,
    private options: IUoWOptions = {
      debugMode: true,
      isolationLevel: 'READ COMMITTED',
    },
  ) {
    this.id = v7();
    this.queryRunner = dataSource.createQueryRunner();
  }

  async init() {
    await this.queryRunner.connect();
    await this.queryRunner?.startTransaction(
      this.options?.isolationLevel || 'READ COMMITTED',
    );
    this.manager = this.queryRunner.manager;

    this.userRepository = new TypeOrmUserRepository(this.manager);
    this.orderRepository = new TypeOrmOrderRepository(this.manager);
    this.options?.debugMode &&
      Logger.debug(`TX = ${this.id}`, 'TX:START:UserOrder');
  }

  async commit(): Promise<void> {
    this.options?.debugMode &&
      Logger.debug(`TX = ${this.id}`, 'TX:COMMITTING:UserOrder');
    await this.queryRunner.commitTransaction();
    await this.release();
  }

  async rollback(): Promise<void> {
    this.options?.debugMode &&
      Logger.debug(`TX = ${this.id}`, 'TX:ROLLBACK:UserOrder');
    await this.queryRunner.rollbackTransaction();
    await this.release();
  }

  async release(): Promise<void> {
    await this.queryRunner.release();
  }

  getUserRepository(): IUserRepository {
    return this.userRepository;
  }

  getOrderRepository(): IOrderRepository {
    return this.orderRepository;
  }
}
