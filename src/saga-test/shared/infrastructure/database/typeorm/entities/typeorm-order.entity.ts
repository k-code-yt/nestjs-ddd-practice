import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { TypeOrmUser } from './typeorm-user';
import { TypeOrmPayment } from './typeorm-payment';
import { OrderStatus } from '../../../../../order/domain/order.entity';

@Entity('orders')
export class TypeOrmOrder {
  @PrimaryColumn()
  id: string;

  @Column({ nullable: true })
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column()
  userId: string;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.Created,
  })
  status: OrderStatus;

  @ManyToOne(() => TypeOrmUser, (user) => user.orders)
  @JoinColumn({ name: 'userId' })
  user: TypeOrmUser;

  @OneToMany(() => TypeOrmPayment, (payment) => payment.order)
  payments: TypeOrmPayment[];
}
