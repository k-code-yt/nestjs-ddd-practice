import { Logger } from '@nestjs/common';
import { QueryRunner, EntityManager, DataSource } from 'typeorm';
import { IUnitOfWork } from '../../../application/ports/unit-of-work.interface';
import {
  IUserRepository,
  IOrderRepository,
} from '../../../application/repositories/repos';
import { TypeOrmOrderRepository } from '../repos/orm-order.repo';
import { TypeOrmUserRepository } from '../repos/orm-user.repo';
import { BaseUnitOfWork } from './base.uow';

export class UserOrderUnitOfWork extends BaseUnitOfWork implements IUnitOfWork {
  private manager: EntityManager;
  private userRepository: IUserRepository;
  private orderRepository: IOrderRepository;

  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async initialize(): Promise<BaseUnitOfWork> {
    this.queryRunner = this.dataSource.createQueryRunner();
    await this.queryRunner.connect();
    await this.queryRunner.startTransaction('SERIALIZABLE');
    this.manager = this.queryRunner.manager;

    this.userRepository = new TypeOrmUserRepository(this.manager);
    this.orderRepository = new TypeOrmOrderRepository(this.manager);

    Logger.warn(`TX = ${this.id}`, 'TX:START:UserOrder');
    return this;
  }

  getUserRepository(): IUserRepository {
    return this.userRepository;
  }

  getOrderRepository(): IOrderRepository {
    return this.orderRepository;
  }

  public static INJECTION_TOKEN = Symbol('UserOrderUnitOfWork');
}
