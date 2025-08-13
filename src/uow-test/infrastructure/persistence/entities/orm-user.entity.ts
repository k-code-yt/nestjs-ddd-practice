import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { OrderTypeOrmEntity } from './orm-order.entity';
import { PaymentTypeOrmEntity } from './orm-payment.entity';

@Entity('users')
export class UserTypeOrmEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  email: string;

  @Column()
  name: string;

  @OneToMany(() => OrderTypeOrmEntity, (order) => order.user, { cascade: true })
  orders: OrderTypeOrmEntity[];

  @OneToMany(() => PaymentTypeOrmEntity, (payments) => payments.user)
  payments: PaymentTypeOrmEntity[];
}
