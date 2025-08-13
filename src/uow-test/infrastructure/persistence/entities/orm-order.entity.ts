import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { UserTypeOrmEntity } from './orm-user.entity';

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
}
