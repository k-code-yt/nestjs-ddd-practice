import { EventEmitter2 } from '@nestjs/event-emitter';
import { Order, OrderData } from '../domain/order.entity';
import { UserId } from '../../shared/domain/value-objects/user-id.vo';
import { IUpdateOrderRepo } from './repositories/order.repository';
import { PaymentId } from '../../shared/domain/value-objects/payment-id.vo';
import { OrderId } from '../../shared/domain/value-objects/order-id.vo';
import { OrderConfirmedEvent } from '../domain/events/order-confirmed.event';
import { Messaging } from '../../shared/infrastructure/messaging/messaging.config';

export abstract class UpdateOrderDataAccess {
  orderRepo: IUpdateOrderRepo;
}

export interface IUpdateOrderUseCaseParams {
  id: string;
  userId: string;
  paymentId: string;
  correlationId: string;
}

export class UpdateOrderUseCase {
  constructor(
    private readonly dataAccess: UpdateOrderDataAccess,
    private readonly params: IUpdateOrderUseCaseParams,
    // TODO replace with interface
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute() {
    const orderParams: OrderData = {
      userId: UserId.fromString(this.params.userId),
      paymentId: PaymentId.fromString(this.params.paymentId),
      id: OrderId.fromString(this.params.id),
    };

    const order = new Order(orderParams);
    order.update();

    await this.dataAccess.orderRepo.update(order);

    // const orderConfirmedEvent = OrderConfirmedEvent.create({
    //   orderId: order.id.value,
    //   status: order.status,
    //   userId: order.userId.value,
    //   correlationId: this.params.correlationId,
    // });

    // this.eventEmitter.emit(
    //   Messaging.OrderEventsEnum.OrderConfirmed,
    //   orderConfirmedEvent,
    // );
    return order;
  }
}
