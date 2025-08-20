import { Module } from '@nestjs/common';
import { InfraModule } from './saga-test/shared/infrastructure/infra.module';
import { PaymentMessageModule } from './saga-test/payment/infra/payment-messaging.module';
import { Messaging } from './saga-test/shared/infrastructure/messaging/messaging.config';
import { PaymentController } from './saga-test/payment/presenter/payment.controller';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { OrderController } from './uow-test/presenter/ order.controller';
import { InfrastructureModule } from './uow-test/infrastructure/persistence/database.module';
import { EventHandlerModuler } from './saga-test/shared/infrastructure/event-handlers/event-handlers.module';
import { ScheduleModule } from '@nestjs/schedule';

const msgDriver = Messaging.MessageDriverTypeEnum.kafka;

// For SAGA testing
// // TODO -> must be within paymModule
const domainInfraModules = [
  PaymentMessageModule.forRoot({ messagingDriver: msgDriver }),
];

// @Module({
//   imports: [
//     EventEmitterModule.forRoot({ global: true }),
//     ScheduleModule.forRoot(),
//     InfraModule.forRoot({
//       messagingDriver: msgDriver,
//     }),
//     ...domainInfraModules,
//   ],
//   controllers: [PaymentController],
//   providers: [],
// })
// export class AppModule {}

// For UOW testing
@Module({
  imports: [InfrastructureModule],
  controllers: [OrderController],
  providers: [],
})
export class AppModule {}
