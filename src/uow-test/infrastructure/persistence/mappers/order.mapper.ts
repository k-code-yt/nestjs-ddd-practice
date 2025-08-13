import { Order } from '../../../domain/order.entity';
import { OrderTypeOrmEntity } from '../entities/orm-order.entity';

export class OrderMapper {
  static toDomain(entity: OrderTypeOrmEntity): Order {
    return new Order(
      entity.id,
      entity.description,
      entity.amount,
      entity.userId,
    );
  }

  static toTypeOrm(domain: Order): OrderTypeOrmEntity {
    const entity = new OrderTypeOrmEntity();
    entity.id = domain.id;
    entity.description = domain.description;
    entity.amount = domain.amount;
    entity.userId = domain.userId;
    return entity;
  }
}
