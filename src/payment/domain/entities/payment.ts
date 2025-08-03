import { ISpecification } from '../../../shared/interfaces/specification.interface';
import { Money } from '../../../shared/domain/value-objects/money.vo';
import { UserId } from '../../../shared/domain/value-objects/user-id.vo';
import { PaymentId } from '../../../shared/domain/value-objects/payment-id.vo';

export enum PaymentStatusEnum {
  active = 'active',
  pending = 'pending',
  paid = 'paid',
  archived = 'archived',
}

export interface ICalculationPolicy {
  calculatePayment(amount: Money): Money;
}

export interface IPaymentParams {
  id: PaymentId;
  userId: UserId;
  chargeAmount: Money;
  paymentAmount?: Money;
  status?: PaymentStatusEnum;
}

export interface IPaymentBuilder {
  build(): Payment;
}

export class Payment {
  constructor(
    private readonly params: IPaymentParams,
    private readonly calculationPolicy: ICalculationPolicy,
    private readonly specs: ISpecification<Payment>[],
  ) {}

  private ensureSpecs(): void {
    if (this.specs?.length > 0) {
      for (const s of this.specs) {
        const isSatisfied = s.isSatisfiedBy(this);
        if (!isSatisfied) {
          // TODO -> add propper domain error
          throw new Error(s.reason(this));
        }
      }
    }
  }

  private applyCalculationPolicy(): this {
    this.params.paymentAmount = this.calculationPolicy.calculatePayment(
      this.params.chargeAmount,
    );
    return this;
  }

  public applyIdIfMissing() {
    if (!this.params.id) {
      this.params.id = PaymentId.create();
    }
  }

  public post(): this {
    this.applyIdIfMissing();
    this.applyCalculationPolicy();
    this.ensureSpecs();
    return this;
  }

  get chargeAmount(): Money {
    return this.params.chargeAmount;
  }

  set chargeAmount(amount: Money) {
    this.params.chargeAmount = amount;
  }

  get paymentAmount(): Money | undefined {
    return this.params.paymentAmount;
  }

  get status(): PaymentStatusEnum | undefined {
    return this.params.status;
  }

  set status(status: PaymentStatusEnum | undefined) {
    this.params.status = status;
  }

  get id(): PaymentId {
    return this.params.id;
  }

  get userId(): UserId {
    return this.params.userId;
  }
}
