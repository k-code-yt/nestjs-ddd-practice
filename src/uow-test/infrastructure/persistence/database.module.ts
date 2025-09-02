import { Module, Scope } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { databaseConfig } from './database.config';
import { OrderTypeOrmEntity } from './entities/orm-order.entity';
import { UserTypeOrmEntity } from './entities/orm-user.entity';
import { PaymentTypeOrmEntity } from './entities/orm-payment.entity';
import {
  UserOrderDataAccess,
  UserOrderUOWForModule,
} from '../../application/repositories/repos';
import { UserOrderUnitOfWorkForModule } from './uow/user-order.uow-for-module';
import {
  TransferOrderOwnershipPresenter,
  TransferOrderOwnershipUseCase,
} from '../../application/use-cases/transfer-order-ownership.use-case';
import { HTTPTransferOrderOwnershipPresenter } from '../../presenter/order.presenter';
import { OrderController } from '../../presenter/order.controller';
import { TransactionalPresenterDecorator } from '../../presenter/order-presenter.decorator';

// {
//   provide: TransferOrderOwnershipPresenter,
//   useFactory: async (
//     uow: UserOrderUOWForModule,
//   ): Promise<TransferOrderOwnershipPresenter> => {
//     const origPresenter = new HTTPTransferOrderOwnershipPresenter();
//     const originalUpdate = origPresenter.update.bind(origPresenter);
//     const originalOnError = origPresenter.onError.bind(origPresenter);

//     origPresenter.update = async function (args: any) {
//       try {
//         await originalUpdate(args);
//         await uow.commit();
//       } catch (error) {
//         await uow.rollback();
//         throw error;
//       }
//     };

//     origPresenter.onError = async function (args: any) {
//       try {
//         await originalOnError(args);
//       } finally {
//         await uow.rollback();
//       }
//     };

//     return origPresenter;
//   },
//   inject: [UserOrderUOWForModule],
// },
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
      provide: UserOrderUOWForModule,
      scope: Scope.REQUEST,
      useFactory: async (dataSource: DataSource) => {
        const uow = new UserOrderUnitOfWorkForModule(dataSource, {
          isolationLevel: 'SERIALIZABLE',
        });
        return uow;
      },
      inject: [DataSource],
    },
    {
      provide: UserOrderDataAccess,
      scope: Scope.REQUEST,
      useFactory: async (uow: UserOrderUOWForModule) => {
        await uow.init();
        return uow;
      },
      inject: [UserOrderUOWForModule],
    },
    HTTPTransferOrderOwnershipPresenter,
    {
      provide: TransferOrderOwnershipPresenter,
      scope: Scope.REQUEST,
      useFactory: async (
        basePresenter: TransferOrderOwnershipPresenter,
        uow: UserOrderUOWForModule,
      ) => {
        return new TransactionalPresenterDecorator(basePresenter, uow);
      },
      inject: [HTTPTransferOrderOwnershipPresenter, UserOrderUOWForModule],
    },
    {
      provide: TransferOrderOwnershipUseCase,
      scope: Scope.REQUEST,
      useFactory: async (
        uow: UserOrderDataAccess,
        presenter: TransferOrderOwnershipPresenter,
      ) => {
        return new TransferOrderOwnershipUseCase(uow, presenter);
      },
      inject: [UserOrderDataAccess, TransferOrderOwnershipPresenter],
    },
  ],
  exports: [TransferOrderOwnershipUseCase],
})
export class InfrastructureModule {}
