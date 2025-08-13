import { EntityManager } from 'typeorm';
import { IOrderRepository } from '../../../application/repositories/repos';
import { Order } from '../../../domain/order.entity';
import { OrderTypeOrmEntity } from '../entities/orm-order.entity';
import { OrderMapper } from '../mappers/order.mapper';

export class TypeOrmOrderRepository implements IOrderRepository {
  constructor(private manager: EntityManager) {}

  async findById(id: string): Promise<Order | null> {
    const entity = await this.manager.findOne(OrderTypeOrmEntity, {
      where: { id },
    });
    return entity && OrderMapper.toDomain(entity);
  }

  async save(order: Order): Promise<void> {
    const entity = OrderMapper.toTypeOrm(order);
    await this.manager.save(OrderTypeOrmEntity, entity);
  }
}
