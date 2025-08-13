import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { UserTypeOrmEntity } from './entities/orm-user.entity';
import { OrderTypeOrmEntity } from './entities/orm-order.entity';
import { PaymentTypeOrmEntity } from './entities/orm-payment.entity';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: 5432,
  username: 'user',
  password: 'pass',
  database: 'uow_test',
  entities: [UserTypeOrmEntity, OrderTypeOrmEntity, PaymentTypeOrmEntity],
  synchronize: true,
  logging: true,
};
