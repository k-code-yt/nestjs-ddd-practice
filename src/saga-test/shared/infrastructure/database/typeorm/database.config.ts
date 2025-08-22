import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { TypeOrmUserAuth } from './entities/typeorm-user-auth.entity';
import { TypeOrmPayment } from './entities/typeorm-payment';
import { TypeOrmPermission } from './entities/typeorm-permission';
import { TypeOrmUser } from './entities/typeorm-user';
import { TypeOrmOutboxEventEntity } from './entities/typeorm-outbox-event.entity';
import { TypeOrmChoreographySagaEntity } from './entities/typeorm-saga';
import { TypeOrmOrder } from './entities/typeorm-order.entity';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: 5432,
  username: 'user',
  password: 'pass',
  database: 'saga_test',
  entities: [
    TypeOrmPayment,
    TypeOrmUser,
    TypeOrmPermission,
    TypeOrmUserAuth,
    TypeOrmChoreographySagaEntity,
    TypeOrmOutboxEventEntity,
    TypeOrmOrder,
  ],
  synchronize: true,
  //   logging: true,
};
