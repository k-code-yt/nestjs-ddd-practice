import { PaymentCalculationPolicyFactory } from '../factories/payment-calculation-policy.factory';
import { Money } from '../../../shared/domain/value-objects/money.vo';
import { PaymentSpecificationFactory } from '../factories/specifications.factory';
import { PaymentBuilder } from '../../domain/entities/payment.builder';
import { PaymentId } from '../../../shared/domain/value-objects/payment-id.vo';
import { UserId } from '../../../shared/domain/value-objects/user-id.vo';
import { IPaymentRepo } from '../repositories/payment.repository';
import { IUserRepo } from '../repositories/user.repository';
import { Messaging } from '../../../shared/infrastructure/messaging/messaging.config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PaymentProcessedEvent } from '../../domain/events/payment-processed.event';
import { OrderCreatedEvent } from '../../../order/domain/events/order-created.event';
import { IPaymentProps } from '../../domain/entities/payment';
import { OrderId } from '../../../shared/domain/value-objects/order-id.vo';

export enum PaymentUserTypeEnum {
  regular = 'regular',
  premium = 'premium',
}

export interface IDataAccess {
  userRepo: IUserRepo;
  paymRepo: IPaymentRepo;
}

export type ICreatePaymentUseCaseParams = {
  userId: string;
  orderId: string;
  chargeAmount: number;
} & Pick<OrderCreatedEvent, 'correlationId'>;

export interface ICreatePaymentMessagePayload {
  paymentId: PaymentId;
  userId: UserId;
  chargeAmount: Money;
}

export class CreatePaymentUseCase {
  constructor(
    private readonly dataAccess: IDataAccess,
    private readonly params: ICreatePaymentUseCaseParams,
    // TODO replace with interface
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute() {
    const permissions = await this.dataAccess.userRepo.getPermissions(
      UserId.fromString(this.params.userId),
    );
    const userType = await this.dataAccess.userRepo.getUserType(
      UserId.fromString(this.params.userId),
    );
    const calcPolicy = new PaymentCalculationPolicyFactory().for({
      userType: userType.type,
    });

    const specs = new PaymentSpecificationFactory().for({
      userId: this.params.userId,
      userPermissions: permissions,
      chargeAmount: new Money(this.params.chargeAmount),
    });

    const paymentParams: IPaymentProps = {
      chargeAmount: new Money(this.params.chargeAmount),
      id: PaymentId.create(),
      userId: UserId.fromString(this.params.userId),
      orderId: OrderId.fromString(this.params.orderId),
    };

    const payment = new PaymentBuilder()
      .withParams(paymentParams)
      .withPolicies(calcPolicy)
      .withSpecs(specs)
      .build();

    payment.post();

    await this.dataAccess.paymRepo.save(payment);

    // ----FOR OUTBOX SAGA----
    // const paymCreateEvent = PaymentProcessedEvent.create({
    //   ...this.params,
    //   paymentId: payment.id.value,
    //   amount: payment.paymentAmount?.amount || 0,
    //   currency: 'USD',
    //   userId: payment.userId.value,
    // });
    // this.eventEmitter.emit(
    //   Messaging.PaymentEventsEnum.PaymentProcessed,
    //   paymCreateEvent,
    // );
    return payment;
  }
}
