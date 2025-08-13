import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PaymentStatusEnum } from '../../../../payment/domain/entities/payment';
import { UserTypeOrmEntity } from './orm-user.entity';

@Entity('payments')
export class PaymentTypeOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('decimal', { precision: 10, scale: 2 })
  chargeAmount: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  paymentAmount: number;

  @Column({
    type: 'enum',
    enum: PaymentStatusEnum,
    default: PaymentStatusEnum.pending,
  })
  status: PaymentStatusEnum;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  externalTransactionId: string;

  @ManyToOne(() => UserTypeOrmEntity, (user) => user.payments, {
    nullable: false,
  })
  @JoinColumn({ name: 'userId' })
  user: UserTypeOrmEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
