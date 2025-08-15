import { PaymentId } from '../../../shared/domain/value-objects/payment-id.vo';
import { Payment } from '../../domain/entities/payment';

export abstract class IPaymentRepo {
  abstract save(payment: Payment): Promise<void>;
  abstract findById(id: PaymentId): Promise<Payment | null>;
}
