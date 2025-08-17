import { Payment } from '../../../domain/entities/payment.entity';
import { Money } from '../../../domain/value-objects/money.vo';
import { OrderId } from '../../../domain/value-objects/order-id.vo';
import { PaymentId } from '../../../domain/value-objects/payment-id.vo';
import { UserId } from '../../../domain/value-objects/user-id.vo';
import { OrderTypeOrmEntity } from '../entities/orm-order.entity';
import { PaymentTypeOrmEntity } from '../entities/orm-payment.entity';
import { UserTypeOrmEntity } from '../entities/orm-user.entity';

export class PaymentMapper {
  static toDomain(entity: PaymentTypeOrmEntity): Payment {
    return new Payment({
      userId: UserId.fromString(entity.user.id),
      chargeAmount: Money.fromDollars(entity.chargeAmount),
      id: PaymentId.fromString(entity.id),
      orderId: OrderId.fromString(entity.order.id),
    });
  }

  static toTypeOrm(domain: Payment): PaymentTypeOrmEntity {
    const entity = new PaymentTypeOrmEntity();
    entity.id = domain.id?.value;
    entity.chargeAmount = domain.chargeAmount.cents;

    if (domain.userId) {
      entity.user = new UserTypeOrmEntity();
      entity.user.id = domain.userId.value;
    }
    if (domain.orderId) {
      entity.order = new OrderTypeOrmEntity();
      entity.order.id = domain.orderId.value;
    }
    if (domain.status) {
      entity.status = domain.status;
    }
    return entity;
  }
}
