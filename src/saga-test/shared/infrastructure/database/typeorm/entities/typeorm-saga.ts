import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  VersionColumn,
  OneToMany,
} from 'typeorm';

import { Messaging } from '../../../messaging/messaging.config';
import { SagaTypeEnum } from '../../../../enums/saga-state.enum';
import { TypeOrmOutboxEventEntity } from './typeorm-outbox-event.entity';

export interface SagaData {
  [key: string]: any;
}

export type SagaEvents =
  | Messaging.OrderEventsEnum
  | Messaging.PaymentEventsEnum
  | Messaging.UserEventsEnum;

export enum SagaState {
  Started = 'started',
  Completed = 'compeleted',
  Failed = 'failed',
}

@Entity('choreography_saga_state')
export class TypeOrmChoreographySagaEntity {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  id: string;

  @Column({ type: 'varchar', length: 100 })
  sagaType: SagaTypeEnum;

  @Column({ type: 'varchar', length: 50 })
  currentEvent: SagaEvents;

  @Column({ type: 'varchar', length: 50 })
  currentState: SagaState;

  @Column({ type: 'json' })
  sagaData: SagaData;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date | null;

  @VersionColumn()
  version: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @OneToMany(() => TypeOrmOutboxEventEntity, (event) => event.saga, {
    onDelete: 'CASCADE',
  })
  events: TypeOrmOutboxEventEntity;

  hasProcessedEvent(eventId: string, eventsProcessed: string[]): boolean {
    return eventsProcessed?.includes(eventId) ?? false;
  }

  isCompleted(): boolean {
    return this.currentState === SagaState.Completed;
  }

  markAsCompleted(): void {
    this.currentState = SagaState.Completed;
    this.completedAt = new Date();
  }

  markAsFailed(): void {
    this.currentState = SagaState.Failed;
    this.completedAt = new Date();
  }
}
