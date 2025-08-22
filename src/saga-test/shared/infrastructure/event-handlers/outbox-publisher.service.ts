import { Injectable, Logger } from '@nestjs/common';
import { MessagingProducer } from '../messaging/messaging.interfaces';
import { TypeOrmOutboxEventRepository } from '../database/typeorm/repositories/typeorm-outbox-event.repository';
import { TypeOrmSagaRepository } from '../database/typeorm/repositories/typeorm-saga.repository';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { TypeOrmOutboxEventEntity } from '../database/typeorm/entities/typeorm-outbox-event.entity';
import { Messaging } from '../messaging/messaging.config';

@Injectable()
export class OutboxPublisherService {
  constructor(
    // TODO -> add abstractions
    private readonly msgService: MessagingProducer,
    private readonly sagaRepo: TypeOrmSagaRepository,
    private readonly outboxRepo: TypeOrmOutboxEventRepository,
    @InjectEntityManager()
    private readonly em: EntityManager,
  ) {}

  private readonly logger = new Logger(OutboxPublisherService.name);
  private isProcessing = false;

  @Cron(CronExpression.EVERY_5_SECONDS)
  async publishPendingEvents(): Promise<void> {
    if (this.isProcessing) {
      this.logger.debug('Outbox publishing already in progress, skipping...');
      return;
    }

    this.isProcessing = true;

    try {
      const unpublishedEvents = await this.outboxRepo.findUnpublishedEvents(50);

      if (unpublishedEvents.length === 0) {
        return;
      }

      this.logger.log(`Publishing ${unpublishedEvents.length} outbox events`);

      for (const event of unpublishedEvents) {
        await this.publishSingleEvent(event);
      }

      this.logger.log(
        `Successfully published ${unpublishedEvents.length} events`,
      );
    } catch (error) {
      this.logger.error('Error during outbox publishing', error.stack);
    } finally {
      this.isProcessing = false;
    }
  }

  private async publishSingleEvent(
    event: TypeOrmOutboxEventEntity,
  ): Promise<void> {
    const queryRunner = this.em.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const currentEvent = await queryRunner.manager.findOne(
        TypeOrmOutboxEventEntity,
        {
          where: { id: event.id, published: false },
        },
      );

      if (!currentEvent) {
        await queryRunner.commitTransaction();
        return;
      }

      await this.msgService.produce(
        event.eventData,
        event.eventType as Messaging.AllDomainEvents,
      );

      await queryRunner.manager.update(TypeOrmOutboxEventEntity, event.id, {
        published: true,
        publishedAt: new Date(),
        errorMessage: null,
      });

      await queryRunner.commitTransaction();

      this.logger.debug(
        `Published event: ${event.eventType} | ID: ${event.id} | Aggregate: ${event.aggregateId}`,
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();

      //   const nextRetryAt = this.calculateNextRetryTime(event.retryCount);

      //   await this.outboxRepo.markAsRetryable(
      //     event.id,
      //     error.message,
      //     nextRetryAt,
      //   );

      //   this.logger.error(
      //     `Failed to publish event: ${event.eventType} | ID: ${event.id} | Error: ${error.message}`,
      //     error.stack,
      //   );
    } finally {
      await queryRunner.release();
    }
  }
}
