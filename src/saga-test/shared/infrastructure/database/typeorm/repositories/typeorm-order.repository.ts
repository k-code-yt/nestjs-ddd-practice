import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { TypeOrmOrder } from '../entities/typeorm-order.entity';
import { Order } from '../../../../../order/domain/order.entity';
import { UserId } from '../../../../domain/value-objects/user-id.vo';
import { OrderId } from '../../../../domain/value-objects/order-id.vo';
import { TypeOrmUser } from '../entities/typeorm-user';
import { Money } from '../../../../domain/value-objects/money.vo';
import {
  IOrderRepo,
  IUpdateOrderRepo,
} from '../../../../../order/use-cases/repositories/order.repository';

export class TypeOrmOrderRepository implements IOrderRepo, IUpdateOrderRepo {
  private repo: Repository<TypeOrmOrder>;
  constructor(
    @InjectEntityManager()
    em: EntityManager,
  ) {
    this.repo = em.connection.getRepository(TypeOrmOrder);
  }

  async findById(id: OrderId): Promise<Order | null> {
    const entity = await this.repo.findOne({
      where: { id: id.value },
      relations: ['user'],
    });
    return entity && this.toDomain(entity);
  }

  async save(order: Order): Promise<void> {
    const entity = this.repo.create(this.toTypeOrm(order));
    await this.repo.save(entity);
  }

  async update(order: Order): Promise<void> {
    const entity = this.repo.create(this.toTypeOrm(order));
    await this.repo.update(entity.id, entity);
  }

  private toTypeOrm(domain: Order): TypeOrmOrder {
    const entity = new TypeOrmOrder();
    entity.id = domain.id.value;
    if (domain.status) {
      entity.status = domain.status;
    }

    if (domain?.amount?.amount) {
      entity.amount = domain.amount.amount;
    }

    if (domain.userId) {
      entity.user = new TypeOrmUser();
      entity.user.id = domain.userId.value;
    }

    if (domain.description) {
      entity.description = domain.description;
    }
    return entity;
  }

  private toDomain(entity: TypeOrmOrder): Order {
    return new Order({
      amount: Money.fromCents(entity.amount),
      userId: UserId.fromString(entity.userId),
      description: entity.description,
      id: OrderId.create(entity.id),
      status: entity.status,
    });
  }
}
