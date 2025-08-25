import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { TypeOrmOutboxEventEntity } from '../entities/typeorm-outbox-event.entity';
import {
  SagaEvents,
  TypeOrmChoreographySagaEntity,
} from '../entities/typeorm-saga';
import { AggregateTypeEnum } from '../../../../enums/aggregate-type.enum';

@Injectable()
export class TypeOrmOutboxEventRepository {
  constructor(
    @InjectRepository(TypeOrmOutboxEventEntity)
    private readonly repository: Repository<TypeOrmOutboxEventEntity>,
  ) {}

  async createEvent(
    eventId: string,
    aggregateId: string,
    aggregateType: AggregateTypeEnum,
    eventType: SagaEvents,
    eventData: any,
    correlationId: string,
    sagaId?: string,
  ): Promise<TypeOrmOutboxEventEntity> {
    const payload: TypeOrmOutboxEventEntity = new TypeOrmOutboxEventEntity();

    payload.id = eventId;
    payload.aggregateId = aggregateId;
    payload.aggregateType = aggregateType;
    payload.eventType = eventType;
    payload.eventData = eventData;
    payload.correlationId = correlationId;
    payload.published = false;
    payload.createdAt = new Date();

    if (sagaId) {
      const saga = new TypeOrmChoreographySagaEntity();
      saga.id = sagaId;
      payload.saga = saga;
    }
    const event = this.repository.create(payload);

    return await this.repository.save(event);
  }

  async addEventMetadata(eventId: string, metadata: any) {
    await this.repository.update(eventId, { metadata });
  }

  async findByCorrelationId(
    correlationId: string,
  ): Promise<TypeOrmOutboxEventEntity | null> {
    return await this.repository.findOne({
      where: { correlationId },
      relations: { saga: true },
      select: { id: true, saga: { id: true } },
    });
  }

  async findUnpublishedEvents(
    limit: number = 100,
  ): Promise<TypeOrmOutboxEventEntity[]> {
    return await this.repository.find({
      where: { published: false },
      order: { createdAt: 'ASC' },
      take: limit,
    });
  }

  async findUnpublishedEventsBySagaId(
    sagaId: string,
  ): Promise<TypeOrmOutboxEventEntity[]> {
    return await this.repository.find({
      where: { published: false, saga: { id: sagaId } },
      order: { createdAt: 'ASC' },
    });
  }

  async markAsPublished(eventId: string): Promise<void> {
    await this.repository.update(eventId, {
      published: true,
      publishedAt: new Date(),
    });
  }

  async markAsRetryable(
    eventId: string,
    errorMessage: string,
    nextRetryAt: Date,
  ): Promise<void> {
    await this.repository.increment({ id: eventId }, 'retryCount', 1);
    await this.repository.update(eventId, {
      errorMessage,
      nextRetryAt,
    });
  }

  async deleteOldEvents(olderThanDays: number = 7): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    await this.repository.delete({
      published: true,
      publishedAt: LessThan(cutoffDate),
    });
  }
}
