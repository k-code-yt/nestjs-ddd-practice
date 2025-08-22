import { v4 as uuid } from 'uuid';
import { BaseCommand } from '../../../shared/application/commands/base.command';

export interface IOrderCreatedEvent {
  orderId: string;
  description?: string;
  amount: number;
  userId: string;
  status: string;
  sagaId?: string;
  correlationId?: string;
}

export class OrderCreatedEvent extends BaseCommand {
  constructor(
    public readonly orderId: string,
    public readonly description: string | undefined,
    public readonly amount: number,
    public readonly userId: string,
    public readonly status: string,
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
  }: IOrderCreatedEvent): OrderCreatedEvent {
    return new OrderCreatedEvent(
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
