import { ISpecification } from '../../../shared/interfaces/specification.interface';
import { Payment, PaymentStatusEnum } from '../entities/payment';

export class AmountSpecification implements ISpecification<Payment> {
  isSatisfiedBy(candidate: Payment): boolean {
    return !candidate.paymentAmount?.isZero();
  }

  reason(candidate: Payment): string {
    return 'payment amount cannot be 0';
  }
}

export class StatusSpecification implements ISpecification<Payment> {
  constructor(
    private allowedStatuses: PaymentStatusEnum[] = [
      PaymentStatusEnum.active,
      PaymentStatusEnum.paid,
      PaymentStatusEnum.pending,
    ],
  ) {}

  isSatisfiedBy(candidate: Payment): boolean {
    if (!candidate.status) {
      return false;
    }
    return this.allowedStatuses.includes(candidate.status);
  }

  reason(candidate: Payment): string {
    return `payment status must be one of: ${this.allowedStatuses.join(', ')}`;
  }
}
