import { Logger } from '@nestjs/common';
import { EntityManager, DataSource } from 'typeorm';
import { IUnitOfWork } from '../../../application/ports/unit-of-work.interface';
import {
  IUserRepository,
  IOrderRepository,
} from '../../../application/repositories/repos';
import { TypeOrmOrderRepository } from '../repos/orm-order.repo';
import { TypeOrmUserRepository } from '../repos/orm-user.repo';
import { BaseUnitOfWork, IUOWInitializeOptions } from './base.uow';

export class UserOrderUnitOfWork extends BaseUnitOfWork implements IUnitOfWork {
  private userRepository: IUserRepository;
  private orderRepository: IOrderRepository;

  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async initialize(options?: IUOWInitializeOptions): Promise<BaseUnitOfWork> {
    await this.initManager(options);
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
