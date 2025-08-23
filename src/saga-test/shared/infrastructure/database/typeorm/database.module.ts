import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './database.config';
import { TypeOrmPaymentRepository } from './repositories/typeorm-payment.repository';
import { TypeOrmUserRepository } from './repositories/typeorm-user.repository';
import { TypeOrmUser } from './entities/typeorm-user';
import { TypeOrmPermission } from './entities/typeorm-permission';
import { TypeOrmPayment } from './entities/typeorm-payment';
import { TypeOrmUserAuth } from './entities/typeorm-user-auth.entity';
import { IUserRepo } from '../../../../payment/application/repositories/user.repository';
import { IPaymentRepo } from '../../../../payment/application/repositories/payment.repository';
import { TypeOrmChoreographySagaEntity } from './entities/typeorm-saga';
import { TypeOrmOutboxEventEntity } from './entities/typeorm-outbox-event.entity';
import { TypeOrmSagaRepository } from './repositories/typeorm-saga.repository';
import { TypeOrmOutboxEventRepository } from './repositories/typeorm-outbox-event.repository';
import { TypeOrmOrderRepository } from './repositories/typeorm-order.repository';
import { TypeOrmOrder } from './entities/typeorm-order.entity';
import { CreateOrderDataAccess } from '../../../../order/use-cases/create-order.use-case';
import {
  IOrderRepo,
  IUpdateOrderRepo,
} from '../../../../order/use-cases/repositories/order.repository';
import { UpdateOrderDataAccess } from '../../../../order/use-cases/update-order.use-case';

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig),
    TypeOrmModule.forFeature([
      TypeOrmPayment,
      TypeOrmUser,
      TypeOrmPermission,
      TypeOrmUserAuth,
      TypeOrmOrder,
      TypeOrmChoreographySagaEntity,
      TypeOrmOutboxEventEntity,
    ]),
  ],
  providers: [
    {
      provide: IPaymentRepo,
      useClass: TypeOrmPaymentRepository,
    },
    {
      provide: IUserRepo,
      useClass: TypeOrmUserRepository,
    },
    {
      provide: IOrderRepo,
      useClass: TypeOrmOrderRepository,
    },
    {
      provide: IUpdateOrderRepo,
      useClass: TypeOrmOrderRepository,
    },
    {
      provide: CreateOrderDataAccess,
      useFactory: (orderRepo: IOrderRepo) => {
        const provider: CreateOrderDataAccess = {
          orderRepo,
        };
        return provider;
      },
      inject: [IOrderRepo],
    },
    {
      provide: UpdateOrderDataAccess,
      useFactory: (orderRepo: IUpdateOrderRepo) => {
        const provider: UpdateOrderDataAccess = {
          orderRepo,
        };
        return provider;
      },
      inject: [IUpdateOrderRepo],
    },
    TypeOrmSagaRepository,
    TypeOrmOrderRepository,
    TypeOrmOutboxEventRepository,
  ],
  exports: [
    IPaymentRepo,
    IUserRepo,
    IOrderRepo,
    IUpdateOrderRepo,
    TypeOrmSagaRepository,
    TypeOrmOutboxEventRepository,
    TypeOrmOrderRepository,
    CreateOrderDataAccess,
    UpdateOrderDataAccess,
  ],
})
export class DBModule {}
