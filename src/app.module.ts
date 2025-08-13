import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './uow-test/infrastructure/persistence/database.config';
import { InfrastructureModule } from './uow-test/infrastructure/persistence/database.module';
import { OrderController } from './uow-test/presenter/ order.controller';

@Module({
  imports: [TypeOrmModule.forRoot(databaseConfig), InfrastructureModule],
  controllers: [OrderController],
  providers: [],
})
export class AppModule {}
