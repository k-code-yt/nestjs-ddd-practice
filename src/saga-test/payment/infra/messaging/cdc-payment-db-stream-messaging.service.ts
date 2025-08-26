import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  MessagingConsumer,
  MessagingProducer,
} from '../../../shared/infrastructure/messaging/messaging.interfaces';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Messaging } from '../../../shared/infrastructure/messaging/messaging.config';
import { OrderCreatedEvent } from '../../domain/events/order-created.event';
import { TypeOrmSagaRepository } from '../../../shared/infrastructure/database/typeorm/repositories/typeorm-saga.repository';
import { TypeOrmOutboxEventRepository } from '../../../shared/infrastructure/database/typeorm/repositories/typeorm-outbox-event.repository';
import { v4 as uuid } from 'uuid';
import { AggregateTypeEnum } from '../../../shared/enums/aggregate-type.enum';
import { SagaTypeEnum } from '../../../shared/enums/saga-state.enum';
import { SagaState } from '../../../shared/infrastructure/database/typeorm/entities/typeorm-saga';
import { PaymentProcessedEvent } from '../../domain/events/payment-processed.event';

export interface IProcessChangeEvent {
  execute(event: any): Promise<void>;
}

// TODO(NEXT)
// add dict and mapping to paymentDomainEvent
// review commits are happening
// catch events on order side
@Injectable()
export class PaymentDBStreamMessagingService implements OnModuleInit {
  constructor(
    private readonly consumer: MessagingConsumer,
    private readonly producer: MessagingProducer,
    private readonly eventEmitter: EventEmitter2,
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

  // {
  //   id: "f5d5d53a-b433-4984-87ca-a7ac6098c9e9",
  //   chargeAmount: "10.00",
  //   paymentAmount: "10.00",
  //   status: "active",
  //   description: null,
  //   externalTransactionId: null,
  //   createdAt: 1756189613899489,
  //   updatedAt: 1756189613899489,
  //   userId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  //   orderId: "fefc8ed5-e0f5-4827-9aa6-abef1c06d3fd",
  // }

  private async processPaymentChange(
    msg: any,
    // msg: PaymentDictionary.ChangeEvent,
    metadata: any,
  ): Promise<void> {
    switch (msg.op) {
      case 'c':
        await this.processPaymentCreated(msg.after);
        break;

      default:
        break;
    }
    this.eventEmitter.emit(
      Messaging.InternalEventsEnum.EventCompleted,
      metadata,
    );
  }

  async processPaymentCreated(data: PaymentProcessedEvent) {
    const previousEvent = await this.eventsRepo.findByCorrelationId(
      data.correlationId,
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

    await this.sagaRepo.updateSagaState(
      sagaId,
      data.eventId,
      Messaging.PaymentEventsEnum.PaymentProcessed,
      //TODO -> add propper interface
      undefined,
      data,
    );

    await this.eventsRepo.createEvent(
      data.eventId,
      data.paymentId,
      AggregateTypeEnum.Payment,
      Messaging.PaymentEventsEnum.PaymentProcessed,
      data,
      data.correlationId,
      sagaId,
    );
  }

  //   TODO -> add factory for each event type
  //   private changeEventFactory(): IProcessChangeEvent {}
}
