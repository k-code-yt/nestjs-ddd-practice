import { EventEmitter2 } from '@nestjs/event-emitter';
import { IOrderRepo } from '../repositories/order.repository';
import { Order, OrderData } from '../domain/order.entity';
import { Money } from '../../shared/domain/value-objects/money.vo';
import { UserId } from '../../shared/domain/value-objects/user-id.vo';
import { Messaging } from '../../shared/infrastructure/messaging/messaging.config';
import { OrderPaymentEvent } from '../events/order-created.event';

// TODOs
// - add messaging module for order
// - add event-handlers module
export interface IDataAccess {
  orderRepo: IOrderRepo;
}

export interface ICreateOrderUseCaseParams {
  userId: string;
  chargeAmount: number;
}

export class CreateOrderUseCase {
  constructor(
    private readonly dataAccess: IDataAccess,
    private readonly params: ICreateOrderUseCaseParams,
    // TODO replace with interface
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute() {
    const orderParams: OrderData = {
      amount: new Money(this.params.chargeAmount),
      userId: UserId.fromString(this.params.userId),
    };

    const order = new Order(orderParams);
    order.post();

    await this.dataAccess.orderRepo.save(order);

    const orderCreateEvent = OrderPaymentEvent.create({
      amount: order.amount.amount,
      description: order.description,
      orderId: order.id.value,
      status: order.status,
      userId: order.userId.value,
    });
    this.eventEmitter.emit(
      Messaging.OrderEventsEnum.OrderCreated,
      orderCreateEvent,
    );
    return order;
  }
}
