import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { ProcessPaymentEvent } from '../../../payment/domain/events/payment-processed.event';
import { Messaging } from '../messaging/messaging.config';
import { Injectable } from '@nestjs/common';
import { TypeOrmSagaRepository } from '../database/typeorm/repositories/typeorm-saga.repository';
import { v4 as uuid } from 'uuid';
import { SagaTypeEnum } from '../../enums/saga-state.enum';
import { SagaState } from '../database/typeorm/entities/typeorm-saga';
import { TypeOrmOutboxEventRepository } from '../database/typeorm/repositories/typeorm-outbox-event.repository';
import { AggregateTypeEnum } from '../../enums/aggregate-type.enum';

@Injectable()
export class PaymentEventHandler {
  constructor(
    // TODO -> add abstractions
    private readonly sagaRepo: TypeOrmSagaRepository,
    private readonly outboxRepo: TypeOrmOutboxEventRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {
    console.log('🎯 EventHandler EventEmitter instance:', this.eventEmitter);
  }

  //  TODO -> add transaction
  @OnEvent(Messaging.PaymentEventsEnum.PaymentProcessed)
  async handlePaymentProcessed(data: ProcessPaymentEvent) {
    const sagaId = data.sagaId || uuid();
    await this.sagaRepo.createSaga(
      sagaId,
      SagaTypeEnum.CreateOrder,
      SagaState.Started,
      Messaging.PaymentEventsEnum.PaymentProcessed,
      data,
    );

    await this.outboxRepo.createEvent(
      data.paymentId,
      AggregateTypeEnum.Payment,
      Messaging.PaymentEventsEnum.PaymentProcessed,
      data,
      data.correlationId,
      sagaId,
    );
  }
}
