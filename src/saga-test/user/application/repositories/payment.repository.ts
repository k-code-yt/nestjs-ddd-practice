import { Payment } from '../../../payment/domain/entities/payment';
import { PaymentId } from '../../../shared/domain/value-objects/payment-id.vo';

export interface IPaymentRepo {
  save(payment: Payment): Promise<void>;
  findById(id: PaymentId): Promise<Payment | null>;
}
