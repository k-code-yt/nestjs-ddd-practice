import { Injectable, OnModuleInit } from '@nestjs/common';
import { MessagingConsumer } from '../../../shared/infrastructure/messaging/messaging.interfaces';
import { Messaging } from '../../../shared/infrastructure/messaging/messaging.config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OrderCreatedEvent } from '../../domain/events/order-created.event';
import { TypeOrmOutboxEventRepository } from '../../../shared/infrastructure/database/typeorm/repositories/typeorm-outbox-event.repository';
import { PaymentProcessedEvent } from '../../domain/events/payment-processed.event';

@Injectable()
export class PaymentMessagingService implements OnModuleInit {
  constructor(
    private readonly consumer: MessagingConsumer,
    private readonly eventEmitter: EventEmitter2,
    private readonly eventsRepo: TypeOrmOutboxEventRepository,
  ) {}

  async onModuleInit() {
    await this.start();
  }

  async start() {
    await this.consumer.start();
    await this.consumeOrderCreated();
  }

  async consumeOrderCreated() {
    await this.consumer.consume(
      Messaging.OrderEventsEnum.OrderCreated,
      this.orderCreatedHandler.bind(this),
    );
  }

  //   {
  //   eventId: "cmd-54a1ac8c-623e-4612-b101-2b44823673bc",
  //   correlationId: "cmd-54a1ac8c-623e-4612-b101-2b44823673bc",
  //   timestamp: "2025-08-25T07:38:51.054Z",
  //   orderId: "b3e7596a-5cc0-4d8f-aa8d-4165ad0a6984",
  //   description: null,
  //   amount: 10,
  //   userId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  //   status: "created",
  //   sagaId: "100e442d-0118-4f77-acb7-d3e4900f44cb",
  //   eventType: "order.created",
  //   messageId: "order.created-1756107531-291",
  // }

  private async orderCreatedHandler(
    msg: PaymentProcessedEvent,
    metadata: any,
  ): Promise<void> {
    // when to commit???
    await this.eventsRepo.addEventMetadata(msg.eventId, metadata);
    //
    // 	{
    //   topic: "order.created",
    //   partition: 0,
    //   offset: "2",
    //   timestamp: "1756107362277",
    //   key: "order.created",
    //   headers: {
    //     "event-type": "order.created",
    //     "content-type": "application/json",
    //   },
    // }
    this.eventEmitter.emit(Messaging.PaymentEventsEnum.PaymentRequested, {
      msg,
      metadata,
    });
  }
}
