import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
  SagaData,
  SagaEvents,
  SagaState,
  TypeOrmChoreographySagaEntity,
} from '../entities/typeorm-saga';
import { SagaTypeEnum } from '../../../../enums/saga-state.enum';
import { TypeOrmOutboxEventRepository } from './typeorm-outbox-event.repository';

@Injectable()
export class TypeOrmSagaRepository {
  constructor(
    @InjectRepository(TypeOrmChoreographySagaEntity)
    private readonly repository: Repository<TypeOrmChoreographySagaEntity>,
    private readonly outboxRepo: TypeOrmOutboxEventRepository,
    private readonly dataSource: DataSource,
  ) {}

  async findBySagaId(
    sagaId: string,
  ): Promise<TypeOrmChoreographySagaEntity | null> {
    return await this.repository.findOne({ where: { id: sagaId } });
  }

  async createSaga(
    sagaId: string,
    sagaType: SagaTypeEnum,
    initialState: SagaState,
    currentEvent: SagaEvents,
    sagaData: SagaData,
  ): Promise<TypeOrmChoreographySagaEntity> {
    const saga = this.repository.create({
      id: sagaId,
      sagaType,
      currentEvent,
      currentState: initialState,
      sagaData,
    });
    saga.createdAt = new Date();
    saga.updatedAt = new Date();

    return await this.repository.save(saga);
  }

  async updateSagaState(
    sagaId: string,
    eventId: string,
    currentEvent: SagaEvents,
    newState?: SagaState,
    sagaData?: Partial<SagaData>,
  ): Promise<TypeOrmChoreographySagaEntity> {
    return await this.dataSource.transaction(async (manager) => {
      const saga = await manager.findOne(TypeOrmChoreographySagaEntity, {
        where: { id: sagaId },
      });

      if (!saga) {
        throw new Error(`Saga not found: ${sagaId}`);
      }

      const processedEvents =
        await this.outboxRepo.findUnpublishedEventsBySagaId(sagaId);

      if (
        saga.hasProcessedEvent(
          eventId,
          processedEvents.map((e) => e.id),
        )
      ) {
        return saga; // Already processed
      }

      if (newState) {
        saga.currentState = newState;
      }
      saga.currentEvent = currentEvent;

      if (sagaData) {
        saga.sagaData = { ...saga.sagaData, ...sagaData };
      }

      if (newState === SagaState.Completed) {
        saga.markAsCompleted();
      } else if (newState === SagaState.Failed) {
        saga.markAsFailed();
      }

      const savedSaga = await manager.save(saga);

      return savedSaga;
    });
  }

  async findActiveSagas(
    sagaType?: SagaTypeEnum,
  ): Promise<TypeOrmChoreographySagaEntity[]> {
    const query = this.repository
      .createQueryBuilder('saga')
      .where('saga.completedAt IS NULL');

    if (sagaType) {
      query.andWhere('saga.sagaType = :sagaType', { sagaType });
    }

    return await query.getMany();
  }

  async findExpiredSagas(
    expirationHours: number = 24,
  ): Promise<TypeOrmChoreographySagaEntity[]> {
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() - expirationHours);

    return await this.repository
      .createQueryBuilder('saga')
      .where('saga.completedAt IS NULL')
      .andWhere('saga.createdAt < :expirationDate', { expirationDate })
      .getMany();
  }
}
