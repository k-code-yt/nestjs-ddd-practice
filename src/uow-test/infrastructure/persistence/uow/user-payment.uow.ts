import { Logger } from '@nestjs/common';
import { QueryRunner, EntityManager, DataSource } from 'typeorm';
import { IUserPaymentUnitOfWork } from '../../../application/ports/unit-of-work.interface';
import {
  IUserRepository,
  IPaymentRepository,
} from '../../../application/repositories/repos';
import { TypeOrmUserRepository } from '../repos/orm-user.repo';
import { BaseUnitOfWork } from './base.uow';
import { TypeOrmPaymentRepository } from '../repos/orm-payment.repo';

export class UserPaymentUnitOfWork
  extends BaseUnitOfWork
  implements IUserPaymentUnitOfWork
{
  private manager: EntityManager;
  private userRepository: IUserRepository;
  private paymentRepository: IPaymentRepository;

  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async initialize(): Promise<UserPaymentUnitOfWork> {
    this.queryRunner = this.dataSource.createQueryRunner();
    await this.queryRunner.connect();
    await this.queryRunner.startTransaction('SERIALIZABLE');
    this.manager = this.queryRunner.manager;

    this.userRepository = new TypeOrmUserRepository(this.manager);
    this.paymentRepository = new TypeOrmPaymentRepository(this.manager);

    Logger.warn(`TX = ${this.id}`, 'TX:START:UserPayment');
    return this;
  }

  getUserRepository(): IUserRepository {
    return this.userRepository;
  }

  getPaymentRepository(): IPaymentRepository {
    return this.paymentRepository;
  }

  public static INJECTION_TOKEN = Symbol('UserPaymentUnitOfWork');
}
