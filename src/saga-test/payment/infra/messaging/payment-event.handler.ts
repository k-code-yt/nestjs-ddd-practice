import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { PaymentProcessedEvent } from '../../domain/events/payment-processed.event';
import { Messaging } from '../../../shared/infrastructure/messaging/messaging.config';
import { Injectable } from '@nestjs/common';
import { TypeOrmSagaRepository } from '../../../shared/infrastructure/database/typeorm/repositories/typeorm-saga.repository';
import { v4 as uuid } from 'uuid';
import { TypeOrmOutboxEventRepository } from '../../../shared/infrastructure/database/typeorm/repositories/typeorm-outbox-event.repository';
import { AggregateTypeEnum } from '../../../shared/enums/aggregate-type.enum';

@Injectable()
export class PaymentEventHandler {
  constructor(
    // TODO -> add abstractions
    private readonly sagaRepo: TypeOrmSagaRepository,
    private readonly outboxRepo: TypeOrmOutboxEventRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  //  TODO -> add transaction
  @OnEvent(Messaging.PaymentEventsEnum.PaymentProcessed)
  async handlePaymentProcessed(data: PaymentProcessedEvent) {
    const previousEvent = await this.outboxRepo.findByCorrelationId(
      data.correlationId,
    );

    const sagaId = previousEvent?.saga?.id;
    if (!sagaId) {
      // TODO -> save failed event
      //   await this.outboxRepo.createEvent(
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

    await this.outboxRepo.createEvent(
      data.eventId,
      data.paymentId,
      AggregateTypeEnum.Payment,
      Messaging.PaymentEventsEnum.PaymentProcessed,
      data,
      data.correlationId,
      sagaId,
    );
  }
}
