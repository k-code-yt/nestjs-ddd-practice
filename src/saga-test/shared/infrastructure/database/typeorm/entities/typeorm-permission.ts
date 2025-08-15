import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TypeOrmUser } from './typeorm-user';
import {
  PermissionType,
  ResourceType,
} from '../../../../../user/domain/value-objects/permission.vo';

@Entity('permissions')
export class TypeOrmPermission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: PermissionType,
  })
  type: PermissionType;

  @Column({
    type: 'enum',
    enum: ResourceType,
  })
  resource: ResourceType;

  @Column({ nullable: true })
  resourceId: string;

  @ManyToOne(() => TypeOrmUser, (user) => user.permissions, { nullable: false })
  @JoinColumn({ name: 'userId' })
  user: TypeOrmUser;

  @CreateDateColumn()
  createdAt: Date;
}
