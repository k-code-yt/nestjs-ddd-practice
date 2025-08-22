import { Controller, Logger } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Messaging } from '../../../shared/infrastructure/messaging/messaging.config';
import { CreateOrderDataAccess } from '../../use-cases/create-order.use-case';
import { PaymentProcessedEvent } from '../../domain/events/payment-processed.event';

@Controller()
export class EventOrderTransport {
  constructor(
    private readonly createDataAccess: CreateOrderDataAccess,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @OnEvent(Messaging.OrderEventsEnum.OrderConfirmRequest)
  async orderConfirm(data: {
    msg: PaymentProcessedEvent;
    metadata: any;
  }): Promise<void> {
    Logger.log(`RECIVED: ${data}`, 'ORDER:CONTROLLER');
  }
}
