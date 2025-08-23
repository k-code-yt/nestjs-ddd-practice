import { OrderId } from '../../../shared/domain/value-objects/order-id.vo';
import { Order } from '../../domain/order.entity';

export abstract class IOrderRepo {
  abstract save(order: Order): Promise<void>;
  abstract findById(id: OrderId): Promise<Order | null>;
}

export abstract class IUpdateOrderRepo {
  abstract update(order: Order): Promise<void>;
}
