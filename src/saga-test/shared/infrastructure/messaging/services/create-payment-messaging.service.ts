import {
  ICreatePaymentMessagePayload,
  IMessaging,
} from '../../../../payment/application/use-cases/create-payment.use-case';
import { Messaging } from '../messaging.config';
import { MessagingProducer } from '../messaging.interfaces';

export class CreatePaymentMessagingService implements IMessaging {
  constructor(private readonly producer: MessagingProducer) {}

  async produce(payload: ICreatePaymentMessagePayload): Promise<void> {
    const message = JSON.stringify({
      paymentId: payload.paymentId.value,
      userId: payload.userId.value,
      chargeAmount: payload.chargeAmount.cents,
    });

    await this.producer.produce(message, Messaging.UpdateUserStepsEnum.Init);
    return;
  }
}
