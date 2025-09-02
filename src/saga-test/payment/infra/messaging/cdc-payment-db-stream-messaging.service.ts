import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  MessagingConsumer,
  MessagingProducer,
} from '../../../shared/infrastructure/messaging/messaging.interfaces';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Messaging } from '../../../shared/infrastructure/messaging/messaging.config';
import { TypeOrmSagaRepository } from '../../../shared/infrastructure/database/typeorm/repositories/typeorm-saga.repository';
import { TypeOrmOutboxEventRepository } from '../../../shared/infrastructure/database/typeorm/repositories/typeorm-outbox-event.repository';
import { AggregateTypeEnum } from '../../../shared/enums/aggregate-type.enum';
import { PaymentProcessedEvent } from '../../domain/events/payment-processed.event';
import { PaymentDictionary } from './dicts/payment.dictionary';

export interface IProcessChangeEvent {
  execute(event: any): Promise<void>;
}

@Injectable()
export class PaymentDBStreamMessagingService implements OnModuleInit {
  constructor(
    private readonly consumer: MessagingConsumer,
    private readonly producer: MessagingProducer,
    private readonly sagaRepo: TypeOrmSagaRepository,
    private readonly eventsRepo: TypeOrmOutboxEventRepository,
  ) {}

  async onModuleInit() {
    await this.start();
  }

  async start() {
    await this.consumer.start();
    await Promise.all([this.consumePaymentChange()]);
  }

  async consumePaymentChange() {
    await this.consumer.consume(
      Messaging.DBStreamingEventsEnum.Payments,
      this.processPaymentChange.bind(this),
    );
  }

  private async processPaymentChange(
    msg: PaymentDictionary.ChangeEvent,
    metadata: any,
  ): Promise<void> {
    switch (msg.op) {
      case 'c':
        await this.processPaymentCreated(
          PaymentDictionary.ChangePayload.create(msg.after),
        );
        break;

      default:
        break;
    }
    await this.consumer.commit(metadata);
  }

  async processPaymentCreated(
    afterCreatePayload: PaymentDictionary.ChangePayload,
  ): Promise<void> {
    const previousEvent = await this.eventsRepo.findLatestByAggregateId(
      afterCreatePayload.orderId,
    );
    const sagaId = previousEvent?.saga?.id;
    if (!sagaId) {
      // TODO -> save failed event
      //   await this.eventsRepo.createEvent(
      //     data.eventId,
      //     data.paymentId,
      //     AggregateTypeEnum.Payment,
      //     Messaging.PaymentEventsEnum.PaymentProcessed,
      //     data,
      //     data.correlationId,
      //     sagaId,
      //   );
      return;
    }

    const data = PaymentProcessedEvent.create({
      amount: Number(afterCreatePayload.paymentAmount),
      currency: 'USD',
      orderId: afterCreatePayload.orderId,
      userId: afterCreatePayload.userId,
      paymentId: afterCreatePayload.paymentId,
      correlationId: previousEvent?.correlationId as string,
      sagaId,
    });

    await this.sagaRepo.updateSagaState(
      sagaId,
      data.eventId,
      Messaging.PaymentEventsEnum.PaymentProcessed,
      //TODO -> add propper interface
      undefined,
      data,
    );

    const event = await this.eventsRepo.createEvent(
      data.eventId,
      data.paymentId,
      AggregateTypeEnum.Payment,
      Messaging.PaymentEventsEnum.PaymentProcessed,
      data,
      data.correlationId,
      sagaId,
    );

    await this.producer.produce(
      event.eventData,
      event.eventType as Messaging.AllDomainEvents,
    );

    await this.eventsRepo.markAsPublished(event.id);
  }

  //   TODO -> add factory for each event type
  //   private changeEventFactory(): IProcessChangeEvent {}
}
