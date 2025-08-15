import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { databaseConfig } from './database.config';
import { TypeOrmPaymentRepository } from './repositories/typeorm-payment.repository';
import { TypeOrmUserRepository } from './repositories/typeorm-user.repository';
import { TypeOrmUser } from './entities/typeorm-user';
import { TypeOrmPermission } from './entities/typeorm-permission';
import { TypeOrmPayment } from './entities/typeorm-payment';
import { TypeOrmUserAuth } from './entities/typeorm-user-auth.entity';
import { IUserRepo } from '../../../../payment/application/repositories/user.repository';
import { IPaymentRepo } from '../../../../payment/application/repositories/payment.repository';

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig),
    TypeOrmModule.forFeature([
      TypeOrmPayment,
      TypeOrmUser,
      TypeOrmPermission,
      TypeOrmUserAuth,
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
  ],
  exports: [IPaymentRepo, IUserRepo],
})
export class DBModule {}
