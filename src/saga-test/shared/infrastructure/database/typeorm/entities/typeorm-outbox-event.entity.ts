import {
  Entity,
  Column,
  CreateDateColumn,
  ManyToOne,
  PrimaryColumn,
  JoinColumn,
} from 'typeorm';
import { TypeOrmChoreographySagaEntity } from './typeorm-saga';

@Entity('outbox_events')
export class TypeOrmOutboxEventEntity {
  @PrimaryColumn()
  id: string;

  @Column({ type: 'varchar', length: 255 })
  aggregateId: string; // orderId, paymentId, etc.

  @Column({ type: 'varchar', length: 100 })
  aggregateType: string; // 'Order', 'Payment', 'User'

  @Column({ type: 'varchar', length: 100 })
  eventType: string; // 'order.created', 'payment.processed'

  @Column({ type: 'json' })
  eventData: any; // The actual event payload

  @Column({ type: 'varchar', length: 255, nullable: true })
  correlationId: string; // For tracing

  @ManyToOne(() => TypeOrmChoreographySagaEntity, (saga) => saga.events, {
    onDelete: 'SET NULL',
  })
  @JoinColumn()
  saga: TypeOrmChoreographySagaEntity;

  @Column({ type: 'boolean', default: false })
  published: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  publishedAt: Date | null;

  @Column({ type: 'int', default: 0 })
  retryCount: number;

  @Column({ type: 'timestamp', nullable: true })
  nextRetryAt: Date | null;

  @Column({ type: 'text', nullable: true })
  errorMessage: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;
}
