import { Money } from '../../shared/domain/value-objects/money.vo';
import { OrderId } from '../../shared/domain/value-objects/order-id.vo';
import { PaymentId } from '../../shared/domain/value-objects/payment-id.vo';
import { UserId } from '../../shared/domain/value-objects/user-id.vo';

export enum OrderStatus {
  Created = 'created',
  Confirmed = 'confirmed',
  Cancelled = 'cancelled',
  Completed = 'completed',
  Failed = 'failed',
}

export type OrderData = {
  id?: OrderId;
  description?: string;
  amount?: Money;
  userId?: UserId;
  paymentId?: PaymentId;
  status?: OrderStatus;
};

export class Order {
  constructor(private orderData: OrderData) {}

  public post() {
    this.applyId();
    this.orderData.status = OrderStatus.Created;
  }

  public update() {
    this.orderData.status = OrderStatus.Confirmed;
  }

  private applyId() {
    if (!this.orderData?.id) {
      this.orderData.id = OrderId.create();
    }
  }

  get id(): OrderId {
    return this.orderData.id as OrderId;
  }

  get status(): OrderStatus {
    return this.orderData.status as OrderStatus;
  }

  get description(): string | undefined {
    return this.orderData.description;
  }

  get amount(): Money {
    return this.orderData.amount as Money;
  }

  get userId(): UserId {
    return this.orderData.userId as UserId;
  }

  get paymentId(): PaymentId {
    return this.orderData.paymentId as PaymentId;
  }
}
