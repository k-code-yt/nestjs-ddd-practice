import { v4 as uuid } from 'uuid';
import { OrderStatus } from '../domain/order.entity';
import { BaseCommand } from '../../shared/application/commands/base.command';

export interface IOrderPaymentEvent {
  orderId: string;
  description?: string;
  amount: number;
  userId: string;
  status: OrderStatus;
  sagaId?: string;
  correlationId?: string;
}

export class OrderPaymentEvent extends BaseCommand {
  constructor(
    public readonly orderId: string,
    public readonly description: string | undefined,
    public readonly amount: number,
    public readonly userId: string,
    public readonly status: OrderStatus,
    public readonly sagaId: string,
    correlationId?: string,
  ) {
    super(correlationId);
  }

  public static create({
    orderId,
    description,
    amount,
    userId,
    status,
    sagaId,
    correlationId,
  }: IOrderPaymentEvent): OrderPaymentEvent {
    return new OrderPaymentEvent(
      orderId,
      description,
      amount,
      userId,
      status,
      sagaId || uuid(),
      correlationId,
    );
  }
}
