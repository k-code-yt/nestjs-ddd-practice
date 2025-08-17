import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { UserTypeOrmEntity } from './orm-user.entity';
import { PaymentTypeOrmEntity } from './orm-payment.entity';

@Entity('orders')
export class OrderTypeOrmEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column()
  userId: string;

  @ManyToOne(() => UserTypeOrmEntity, (user) => user.orders)
  @JoinColumn({ name: 'userId' })
  user: UserTypeOrmEntity;

  @OneToMany(() => PaymentTypeOrmEntity, (payment) => payment.order)
  payments: PaymentTypeOrmEntity[];
}
