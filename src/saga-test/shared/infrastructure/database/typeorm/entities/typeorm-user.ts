import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { TypeOrmPayment } from './typeorm-payment';
import { TypeOrmPermission } from './typeorm-permission';
import { UserTypeEnum } from '../../../../../user/domain/entities/user';

@Entity('users')
export class TypeOrmUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: UserTypeEnum,
  })
  type: UserTypeEnum;

  @Column({ unique: true })
  email: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ select: false, unique: false, nullable: false })
  password: string;

  @UpdateDateColumn()
  passwordUpdatedAt: Date;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => TypeOrmPayment, (payment) => payment.user)
  payments: TypeOrmPayment[];

  @OneToMany(() => TypeOrmPermission, (permission) => permission.user)
  permissions: TypeOrmPermission[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
