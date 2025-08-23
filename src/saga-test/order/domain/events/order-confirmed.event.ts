import { OrderStatus } from '../order.entity';
import { BaseCommand } from '../../../shared/application/commands/base.command';

export interface IOrderConfirmedEvent {
  orderId: string;
  userId: string;
  status: OrderStatus;
  sagaId?: string;
  correlationId: string;
}

export class OrderConfirmedEvent extends BaseCommand {
  constructor(
    public readonly orderId: string,
    public readonly userId: string,
    public readonly status: OrderStatus,
    correlationId: string,
    public readonly sagaId?: string,
  ) {
    super(correlationId);
  }

  public static create({
    orderId,
    userId,
    status,
    sagaId,
    correlationId,
  }: IOrderConfirmedEvent): OrderConfirmedEvent {
    return new OrderConfirmedEvent(
      orderId,
      userId,
      status,
      correlationId,
      sagaId,
    );
  }
}
