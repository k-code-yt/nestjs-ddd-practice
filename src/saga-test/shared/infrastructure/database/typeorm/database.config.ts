import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { TypeOrmUserAuth } from './entities/typeorm-user-auth.entity';
import { TypeOrmPayment } from './entities/typeorm-payment';
import { TypeOrmPermission } from './entities/typeorm-permission';
import { TypeOrmUser } from './entities/typeorm-user';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: 5432,
  username: 'user',
  password: 'pass',
  database: 'uow_test',
  entities: [TypeOrmPayment, TypeOrmUser, TypeOrmPermission, TypeOrmUserAuth],
  synchronize: true,
  logging: true,
};
