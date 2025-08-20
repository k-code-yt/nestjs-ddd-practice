import { Module } from '@nestjs/common';
import { PaymentEventHandler } from './payment-event.handler';
import { OutboxPublisherService } from './outbox-publisher.service';

// TODO -> add eventEmmitter abstraction
@Module({
  providers: [PaymentEventHandler, OutboxPublisherService],
  exports: [OutboxPublisherService],
})
export class EventHandlerModuler {}
