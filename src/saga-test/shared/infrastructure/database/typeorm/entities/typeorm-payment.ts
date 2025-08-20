import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TypeOrmUser } from './typeorm-user';
import { PaymentStatusEnum } from '../../../../../payment/domain/entities/payment';
import { TypeOrmOrder } from './typeorm-order.entity';

@Entity('payments')
export class TypeOrmPayment {
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

  @ManyToOne(() => TypeOrmUser, (user) => user.payments, { nullable: false })
  @JoinColumn({ name: 'userId' })
  user: TypeOrmUser;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => TypeOrmOrder, (order) => order.payments)
  @JoinColumn({ name: 'orderId' })
  order: TypeOrmOrder[];
}
