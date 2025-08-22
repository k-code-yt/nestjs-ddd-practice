import { Module } from '@nestjs/common';
import { InfraModule } from './saga-test/shared/infrastructure/infra.module';
import { Messaging } from './saga-test/shared/infrastructure/messaging/messaging.config';
import { EventPaymentTransport } from './saga-test/payment/interface-adapters/transport/event-payment.transport';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { PaymentMessageModule } from './saga-test/payment/infra/messaging/payment-messaging.module';
import { OrderMessageModule } from './saga-test/order/infra/messaging/order-messaging.module';
import { HTTPOrderTransport } from './saga-test/order/interface-adapters/transport/http-order.controller';
import { EventOrderTransport } from './saga-test/order/interface-adapters/transport/event-order.controller';

const msgDriver = Messaging.MessageDriverTypeEnum.kafka;

// For SAGA testing
// // TODO -> must be within paymModule
const domainInfraModules = [
  PaymentMessageModule.forRoot({ messagingDriver: msgDriver }),
  OrderMessageModule.forRoot({ messagingDriver: msgDriver }),
];

@Module({
  imports: [
    EventEmitterModule.forRoot({ global: true }),
    ScheduleModule.forRoot(),
    InfraModule.forRoot({
      messagingDriver: msgDriver,
    }),
    ...domainInfraModules,
  ],
  //   TODO -> add propper module for these
  controllers: [EventPaymentTransport, HTTPOrderTransport, EventOrderTransport],
  providers: [],
})
export class AppModule {}

// For UOW testing
// @Module({
//   imports: [InfrastructureModule],
//   controllers: [OrderController],
//   providers: [],
// })
// export class AppModule {}
