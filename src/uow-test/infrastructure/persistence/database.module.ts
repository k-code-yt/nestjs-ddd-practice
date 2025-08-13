import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { databaseConfig } from './database.config';
import { OrderTypeOrmEntity } from './entities/orm-order.entity';
import { UserTypeOrmEntity } from './entities/orm-user.entity';
import { ProxyUnitOfWorkFactory } from './proxy-unit-of-work';
import { UserOrderUnitOfWork } from './uow/user-order.uow';
import { PaymentTypeOrmEntity } from './entities/orm-payment.entity';
import { UserPaymentUnitOfWork } from './uow/user-payment.uow';
import { UserOrderUseCaseProvider } from '../providers/user-order-use-case.provider';
import { UserPaymentUseCaseProvider } from '../providers/user-payment-use-case.provider';

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig),
    TypeOrmModule.forFeature([
      UserTypeOrmEntity,
      OrderTypeOrmEntity,
      PaymentTypeOrmEntity,
    ]),
  ],
  providers: [
    {
      provide: UserOrderUnitOfWork.INJECTION_TOKEN,
      useFactory: async (dataSource: DataSource) => {
        return new UserOrderUnitOfWork(dataSource);
      },
      inject: [DataSource],
    },
    {
      provide: UserPaymentUnitOfWork.INJECTION_TOKEN,
      useFactory: async (dataSource: DataSource) => {
        return new UserPaymentUnitOfWork(dataSource);
      },
      inject: [DataSource],
    },
    ProxyUnitOfWorkFactory,
    UserOrderUseCaseProvider,
    UserPaymentUseCaseProvider,
  ],
  exports: [
    UserOrderUnitOfWork.INJECTION_TOKEN,
    UserPaymentUnitOfWork.INJECTION_TOKEN,
    UserOrderUseCaseProvider,
    UserPaymentUseCaseProvider,
  ],
})
export class InfrastructureModule {}
