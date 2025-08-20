import { Module, Scope } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { databaseConfig } from './database.config';
import { OrderTypeOrmEntity } from './entities/orm-order.entity';
import { UserTypeOrmEntity } from './entities/orm-user.entity';
import { ProxyUnitOfWorkFactory } from './uow/proxy-unit-of-work';
import { UserOrderUnitOfWork } from './uow/user-order.uow';
import { PaymentTypeOrmEntity } from './entities/orm-payment.entity';
import { UserPaymentUnitOfWork } from './uow/user-payment.uow';
import { UserOrderUseCaseProvider } from '../providers/user-order-use-case.provider';
import { UserPaymentUseCaseProvider } from '../providers/user-payment-use-case.provider';
import { UserOrderUOW } from '../../application/repositories/repos';
import { UserOrderStateMachineUnitOfWork } from './uow/user-order.state-machine-uow';

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
      provide: UserOrderUOW,
      scope: Scope.REQUEST,
      useFactory: async (dataSource: DataSource) => {
        return new UserOrderStateMachineUnitOfWork(dataSource);
      },
      inject: [DataSource],
    },
  ],
  exports: [UserOrderUOW],
})
export class InfrastructureModule {}
