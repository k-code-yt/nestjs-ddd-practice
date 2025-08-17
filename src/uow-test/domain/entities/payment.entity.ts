import { Money } from '../value-objects/money.vo';
import { OrderId } from '../value-objects/order-id.vo';
import { PaymentId } from '../value-objects/payment-id.vo';
import { UserId } from '../value-objects/user-id.vo';

export enum PaymentStatusEnum {
  active = 'active',
  pending = 'pending',
  paid = 'paid',
  archived = 'archived',
  failed = 'failed',
}

export interface ICalculationPolicy {
  calculatePayment(amount: Money): Money;
}

export interface IPaymentParams {
  id: PaymentId;
  userId: UserId;
  orderId: OrderId;
  chargeAmount: Money;
  paymentAmount?: Money;
  status?: PaymentStatusEnum;
}

export interface IPaymentBuilder {
  build(): Payment;
}

export class Payment {
  constructor(private readonly params: IPaymentParams) {}

  public applyIdIfMissing() {
    if (!this.params.id) {
      this.params.id = PaymentId.create();
    }
  }

  public post(): this {
    this.status = PaymentStatusEnum.active;
    this.applyIdIfMissing();
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

  get orderId(): OrderId {
    return this.params.orderId;
  }
}
