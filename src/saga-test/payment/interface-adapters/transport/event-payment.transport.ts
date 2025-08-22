import { Controller } from '@nestjs/common';
import { CreatePaymentUseCase } from '../../application/use-cases/create-payment.use-case';
import { IPaymentRepo } from '../../application/repositories/payment.repository';
import { IUserRepo } from '../../application/repositories/user.repository';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Messaging } from '../../../shared/infrastructure/messaging/messaging.config';
import { OrderCreatedEvent } from '../../domain/events/order-created.event';

@Controller()
export class EventPaymentTransport {
  constructor(
    private readonly paymRepo: IPaymentRepo,
    private readonly userRepo: IUserRepo,
    // TODO -> add DI
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @OnEvent(Messaging.PaymentEventsEnum.PaymentRequested)
  async create(data: { msg: OrderCreatedEvent; metadata: any }) {
    const uc = new CreatePaymentUseCase(
      {
        paymRepo: this.paymRepo,
        userRepo: this.userRepo,
      },
      {
        chargeAmount: data.msg.amount,
        userId: data.msg.userId,
        correlationId: data.msg.correlationId,
        orderId: data.msg.orderId,
      },
      this.eventEmitter,
    );
    await uc.execute();
  }
}
