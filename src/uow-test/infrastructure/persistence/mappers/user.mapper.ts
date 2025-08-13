import { User } from '../../../domain/user.entity';
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
    entity.name = domain.name;
    return entity;
  }
}
