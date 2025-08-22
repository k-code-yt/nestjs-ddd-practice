import { v4 as uuid } from 'uuid';
import { BaseCommand } from '../../../shared/application/commands/base.command';

export interface IPaymentProcessedEvent {
  paymentId: string;
  orderId: string;
  userId: string;
  amount: number;
  currency: string;
  sagaId?: string;
  correlationId: string;
}

export class PaymentProcessedEvent extends BaseCommand {
  constructor(
    public readonly paymentId: string,
    public readonly userId: string,
    public readonly orderId: string,
    public readonly amount: number,
    public readonly currency: string = 'USD',
    public readonly sagaId?: string,
    correlationId?: string,
  ) {
    super(correlationId);
  }

  public static create({
    amount,
    currency,
    sagaId,
    userId,
    paymentId,
    orderId,
    correlationId,
  }: IPaymentProcessedEvent): PaymentProcessedEvent {
    return new PaymentProcessedEvent(
      paymentId,
      userId,
      orderId,
      amount,
      currency,
      sagaId || uuid(),
      correlationId,
    );
  }
}
