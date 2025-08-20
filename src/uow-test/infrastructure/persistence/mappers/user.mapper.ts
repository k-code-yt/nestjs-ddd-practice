import { Logger } from '@nestjs/common';
import { User } from '../../../domain/entities/user.entity';
import { UserTypeOrmEntity } from '../entities/orm-user.entity';
import { OrderMapper } from './order.mapper';

export class UserMapper {
  static toDomain(entity: UserTypeOrmEntity): User {
    const orders = entity.orders ? entity.orders.map(OrderMapper.toDomain) : [];
    return new User(entity.id, entity.email, entity.name, orders);
  }

  static toTypeOrm(domain: User): UserTypeOrmEntity {
    const entity = new UserTypeOrmEntity();
    entity.id = domain.id;
    entity.email = domain.email;
    entity.name = this.getRandomName();
    Logger.log(`Changing name from ${domain.name} to ${entity.name}`, 'USER');
    return entity;
  }

  static getRandomName() {
    const firstNames = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank'];
    const lastNames = [
      'Smith',
      'Johnson',
      'Williams',
      'Brown',
      'Davis',
      'Miller',
    ];
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    return `${firstName} ${lastName}`;
  }
}
