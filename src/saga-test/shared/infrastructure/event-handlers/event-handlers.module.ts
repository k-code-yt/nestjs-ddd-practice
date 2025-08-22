import { Module } from '@nestjs/common';
import { OutboxPublisherService } from './outbox-publisher.service';

// TODO -> add eventEmmitter abstraction
@Module({
  providers: [OutboxPublisherService],
  exports: [OutboxPublisherService],
})
export class EventHandlerModuler {}
