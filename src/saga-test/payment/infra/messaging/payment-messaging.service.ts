import { Injectable, OnModuleInit } from '@nestjs/common';
import { MessagingConsumer } from '../../../shared/infrastructure/messaging/messaging.interfaces';
import { Messaging } from '../../../shared/infrastructure/messaging/messaging.config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OrderCreatedEvent } from '../../domain/events/order-created.event';

@Injectable()
export class PaymentMessagingService implements OnModuleInit {
  constructor(
    private readonly consumer: MessagingConsumer,
    private readonly eventEmitter: EventEmitter2,
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

  private async orderCreatedHandler(
    msg: OrderCreatedEvent,
    metadata: any,
  ): Promise<void> {
    this.eventEmitter.emit(Messaging.PaymentEventsEnum.PaymentRequested, {
      msg,
      metadata,
    });
  }
}
