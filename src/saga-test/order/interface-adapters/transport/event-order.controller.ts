import { Controller, Logger } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Messaging } from '../../../shared/infrastructure/messaging/messaging.config';
import { PaymentProcessedEvent } from '../../domain/events/payment-processed.event';
import {
  UpdateOrderDataAccess,
  UpdateOrderUseCase,
} from '../../use-cases/update-order.use-case';

// TODO
// - make domain messaging consumers work in parallel
// - fix messaging provider tokens, they overwrite each other
@Controller()
export class EventOrderTransport {
  constructor(
    private readonly updateDataAccess: UpdateOrderDataAccess,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @OnEvent(Messaging.OrderEventsEnum.OrderConfirmRequest)
  async orderConfirm(data: {
    msg: PaymentProcessedEvent;
    metadata: any;
  }): Promise<void> {
    const uc = new UpdateOrderUseCase(
      this.updateDataAccess,
      {
        id: data.msg.orderId,
        paymentId: data.msg.paymentId,
        userId: data.msg.userId,
        correlationId: data.msg.correlationId,
      },
      this.eventEmitter,
    );

    await uc.execute();
  }
}
