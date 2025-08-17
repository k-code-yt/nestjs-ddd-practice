import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { IUserPaymentUnitOfWork } from '../../../application/ports/unit-of-work.interface';
import {
  IUserRepository,
  IPaymentRepository,
  IOrderRepository,
} from '../../../application/repositories/repos';
import { TypeOrmUserRepository } from '../repos/orm-user.repo';
import { BaseUnitOfWork, IUOWInitializeOptions } from './base.uow';
import { TypeOrmPaymentRepository } from '../repos/orm-payment.repo';
import { TypeOrmOrderRepository } from '../repos/orm-order.repo';

export class UserPaymentUnitOfWork
  extends BaseUnitOfWork
  implements IUserPaymentUnitOfWork
{
  private userRepository: IUserRepository;
  private paymentRepository: IPaymentRepository;
  private orderRepository: IOrderRepository;

  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async initialize(
    options?: IUOWInitializeOptions,
  ): Promise<UserPaymentUnitOfWork> {
    await this.initManager(options);
    this.userRepository = new TypeOrmUserRepository(this.manager);
    this.paymentRepository = new TypeOrmPaymentRepository(this.manager);
    this.orderRepository = new TypeOrmOrderRepository(this.manager);

    Logger.warn(`TX = ${this.id}`, 'TX:START:UserPayment');
    return this;
  }

  getUserRepository(): IUserRepository {
    return this.userRepository;
  }

  getPaymentRepository(): IPaymentRepository {
    return this.paymentRepository;
  }

  getOrderRepository(): IOrderRepository {
    return this.orderRepository;
  }

  public static INJECTION_TOKEN = Symbol('UserPaymentUnitOfWork');
}
