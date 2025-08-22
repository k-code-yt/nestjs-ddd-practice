import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Messaging } from '../../../shared/infrastructure/messaging/messaging.config';
import { Injectable } from '@nestjs/common';
import { TypeOrmSagaRepository } from '../../../shared/infrastructure/database/typeorm/repositories/typeorm-saga.repository';
import { v4 as uuid } from 'uuid';
import { TypeOrmOutboxEventRepository } from '../../../shared/infrastructure/database/typeorm/repositories/typeorm-outbox-event.repository';
import { AggregateTypeEnum } from '../../../shared/enums/aggregate-type.enum';
import { SagaState } from '../../../shared/infrastructure/database/typeorm/entities/typeorm-saga';
import { OrderCreatedEvent } from '../../domain/events/order-created.event';
import { SagaTypeEnum } from '../../../shared/enums/saga-state.enum';

@Injectable()
export class OrderEventHandler {
  constructor(
    // TODO -> add abstractions
    private readonly sagaRepo: TypeOrmSagaRepository,
    private readonly outboxRepo: TypeOrmOutboxEventRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  //  TODO -> add transaction
  @OnEvent(Messaging.OrderEventsEnum.OrderCreated)
  async handleOrderProcessed(data: OrderCreatedEvent) {
    const sagaId = data.sagaId || uuid();

    await this.sagaRepo.createSaga(
      sagaId,
      SagaTypeEnum.CreateOrder,
      SagaState.Started,
      Messaging.OrderEventsEnum.OrderCreated,
      data,
    );

    await this.outboxRepo.createEvent(
      data.eventId,
      data.orderId,
      AggregateTypeEnum.Order,
      Messaging.OrderEventsEnum.OrderCreated,
      data,
      data.correlationId,
      sagaId,
    );
  }
}
