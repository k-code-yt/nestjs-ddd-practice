import { v4 as uuid } from 'uuid';
import { BaseCommand } from '../../../shared/application/commands/base.command';

export interface IProcessPaymentEvent {
  paymentId: string;
  userId: string;
  amount: number;
  currency: string;
  sagaId?: string;
  correlationId?: string;
}

export class ProcessPaymentEvent extends BaseCommand {
  constructor(
    public readonly paymentId: string,
    public readonly userId: string,
    public readonly amount: number,
    public readonly currency: string = 'USD',
    public readonly sagaId: string,
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
    correlationId,
  }: IProcessPaymentEvent): ProcessPaymentEvent {
    return new ProcessPaymentEvent(
      paymentId,
      userId,
      amount,
      currency,
      sagaId || uuid(),
      correlationId,
    );
  }
}
