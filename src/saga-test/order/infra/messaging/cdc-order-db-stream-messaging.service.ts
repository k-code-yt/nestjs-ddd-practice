import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  MessagingConsumer,
  MessagingProducer,
} from '../../../shared/infrastructure/messaging/messaging.interfaces';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Messaging } from '../../../shared/infrastructure/messaging/messaging.config';
import { OrderCreatedEvent } from '../../domain/events/order-created.event';
import { OrderDictionary } from './dicts/order.dictionary';
import { TypeOrmSagaRepository } from '../../../shared/infrastructure/database/typeorm/repositories/typeorm-saga.repository';
import { TypeOrmOutboxEventRepository } from '../../../shared/infrastructure/database/typeorm/repositories/typeorm-outbox-event.repository';
import { v4 as uuid } from 'uuid';
import { AggregateTypeEnum } from '../../../shared/enums/aggregate-type.enum';
import { SagaTypeEnum } from '../../../shared/enums/saga-state.enum';
import { SagaState } from '../../../shared/infrastructure/database/typeorm/entities/typeorm-saga';
import { OrderConfirmedEvent } from '../../domain/events/order-confirmed.event';

export interface IProcessChangeEvent {
  execute(event: any): Promise<void>;
}

@Injectable()
export class OrderDBStreamMessagingService implements OnModuleInit {
  constructor(
    private readonly consumer: MessagingConsumer,
    private readonly producer: MessagingProducer,
    private readonly sagaRepo: TypeOrmSagaRepository,
    private readonly outboxRepo: TypeOrmOutboxEventRepository,
  ) {}

  async onModuleInit() {
    await this.start();
  }

  async start() {
    await this.consumer.start();
    await Promise.all([this.consumeOrderChange()]);
  }

  async consumeOrderChange() {
    await this.consumer.consume(
      Messaging.DBStreamingEventsEnum.Orders,
      this.processOrderChange.bind(this),
    );
  }

  private async processOrderChange(
    msg: OrderDictionary.ChangeEvent,
    metadata: any,
  ): Promise<void> {
    switch (msg.op) {
      case 'c':
        await this.processOrderCreated(msg.after);
        break;
      case 'u':
        await this.processOrderUpdated(msg.after, msg.before);
        break;

      default:
        break;
    }
    this.consumer.commit(metadata);
  }

  // TODO -> add transaction
  private async processOrderCreated(
    msg: OrderDictionary.ChangePayload,
  ): Promise<void> {
    const orderCreateEvent = OrderCreatedEvent.create({
      orderId: msg.id,
      description: msg.description,
      amount: Number(msg.amount),
      userId: msg.userId,
      status: msg.status,
    });

    const sagaId = uuid();

    await this.sagaRepo.createSaga(
      sagaId,
      SagaTypeEnum.CreateOrder,
      SagaState.Started,
      Messaging.OrderEventsEnum.OrderCreated,
      orderCreateEvent,
    );

    const event = await this.outboxRepo.createEvent(
      uuid(),
      orderCreateEvent.orderId,
      AggregateTypeEnum.Order,
      Messaging.OrderEventsEnum.OrderCreated,
      orderCreateEvent,
      orderCreateEvent.correlationId,
      sagaId,
    );

    await this.producer.produce(
      event.eventData,
      event.eventType as Messaging.AllDomainEvents,
    );

    await this.outboxRepo.markAsPublished(event.id);
  }

  private async processOrderUpdated(
    after: OrderDictionary.ChangePayload,
    before: OrderDictionary.ChangePayload,
  ): Promise<void> {
    const prevEvent = await this.outboxRepo.findLatestByAggregateId(after.id);
    const sagaId = prevEvent?.saga?.id;
    if (!sagaId) {
      // internal err
      throw new Error('');
    }

    const event = OrderConfirmedEvent.create({
      correlationId: prevEvent.correlationId,
      orderId: after.id,
      status: after.status,
      userId: after.userId,
      sagaId,
    });

    await this.sagaRepo.updateSagaState(
      sagaId,
      event.eventId,
      Messaging.OrderEventsEnum.OrderConfirmed,
      SagaState.Completed,
      event,
    );

    // ---PUBLISH FOR NOTIFICATIONS?
    // 	await this.producer.produce(
    // 	event.eventData,
    // 	event.eventType as Messaging.AllDomainEvents,
    //   );

    //   await this.outboxRepo.markAsPublished(event.id);
  }
}
