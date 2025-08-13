import { Payment } from '../../../../saga-test/payment/domain/entities/payment';
import { Money } from '../../../../saga-test/shared/domain/value-objects/money.vo';
import { PaymentId } from '../../../../saga-test/shared/domain/value-objects/payment-id.vo';
import { UserId } from '../../../../saga-test/shared/domain/value-objects/user-id.vo';
import { PaymentTypeOrmEntity } from '../entities/orm-payment.entity';
import { UserTypeOrmEntity } from '../entities/orm-user.entity';

export class PaymentMapper {
  static toDomain(entity: PaymentTypeOrmEntity): Payment {
    return new Payment(
      {
        userId: UserId.fromString(entity.user.id),
        chargeAmount: Money.fromDollars(entity.chargeAmount),
        id: PaymentId.fromString(entity.id),
      },
      {} as any,
      {} as any,
    );
  }

  static toTypeOrm(domain: Payment): PaymentTypeOrmEntity {
    const entity = new PaymentTypeOrmEntity();
    entity.id = domain.id?.value;
    if (domain.userId) {
      entity.user = new UserTypeOrmEntity();
      entity.user.id = domain.userId.value;
    }
    entity.chargeAmount = domain.chargeAmount.cents;
    if (domain.status) {
      entity.status = domain.status;
    }
    return entity;
  }
}
