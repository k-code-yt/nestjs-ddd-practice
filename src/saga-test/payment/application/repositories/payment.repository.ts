import { PaymentId } from '../../../shared/domain/value-objects/payment-id.vo';
import { Payment } from '../../domain/entities/payment';

export interface IPaymentRepo {
  save(payment: Payment): Promise<void>;
  findById(id: PaymentId): Promise<Payment | null>;
}
