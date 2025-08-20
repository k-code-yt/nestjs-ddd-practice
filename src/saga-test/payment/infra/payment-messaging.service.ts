import { Injectable, OnModuleInit } from '@nestjs/common';
import { MessagingConsumer } from '../../shared/infrastructure/messaging/messaging.interfaces';
import { Messaging } from '../../shared/infrastructure/messaging/messaging.config';
import { EventEmitter2 } from '@nestjs/event-emitter';

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
    await this.consumePaymentProcessed();
  }

  async consumePaymentProcessed() {
    await this.consumer.consume(
      Messaging.PaymentEventsEnum.PaymentProcessed,
      this.paymentProcessedHandler.bind(this),
    );
  }

  private async paymentProcessedHandler(
    msg: any,
    metadata: any,
  ): Promise<void> {
    this.eventEmitter.emit(Messaging.PaymentEventsEnum.PaymentProcessed, {
      msg,
      metadata,
    });
  }
}
