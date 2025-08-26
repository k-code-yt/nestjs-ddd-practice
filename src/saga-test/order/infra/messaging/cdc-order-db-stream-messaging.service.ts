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

export interface IProcessChangeEvent {
  execute(event: any): Promise<void>;
}

@Injectable()
export class OrderDBStreamMessagingService implements OnModuleInit {
  constructor(
    private readonly consumer: MessagingConsumer,
    private readonly producer: MessagingProducer,
    private readonly eventEmitter: EventEmitter2,
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

      default:
        break;
    }
    this.eventEmitter.emit(
      Messaging.InternalEventsEnum.EventCompleted,
      metadata,
    );
  }

  // TODO -> add transaction
  private async processOrderCreated(
    msg: OrderDictionary.CreateEvent,
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

  //   TODO -> add factory for each event type
  //   private changeEventFactory(): IProcessChangeEvent {}
}
