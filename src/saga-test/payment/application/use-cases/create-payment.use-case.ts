import { PaymentCalculationPolicyFactory } from '../factories/payment-calculation-policy.factory';
import { Money } from '../../../shared/domain/value-objects/money.vo';
import { PaymentSpecificationFactory } from '../factories/specifications.factory';
import { PaymentBuilder } from '../../domain/entities/payment.builder';
import { PaymentId } from '../../../shared/domain/value-objects/payment-id.vo';
import { UserId } from '../../../shared/domain/value-objects/user-id.vo';
import { IPaymentRepo } from '../repositories/payment.repository';
import { IUserRepo } from '../repositories/user.repository';
import { Messaging } from '../../../shared/infrastructure/messaging/messaging.config';
import { IPaymentInput } from '../../domain/entities/payment';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ProcessPaymentEvent } from '../../domain/events/payment-processed.event';

export enum PaymentUserTypeEnum {
  regular = 'regular',
  premium = 'premium',
}

export interface IDataAccess {
  userRepo: IUserRepo;
  paymRepo: IPaymentRepo;
}

export interface ICreatePaymentUseCaseParams {
  userId: string;
  chargeAmount: number;
}

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
  ) {
    console.log('📤 UseCase EventEmitter instance:', this.eventEmitter);
  }

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

    const paymentParams: IPaymentInput = {
      chargeAmount: new Money(this.params.chargeAmount),
      id: PaymentId.create(),
      userId: UserId.fromString(this.params.userId),
    };

    const payment = new PaymentBuilder()
      .withParams(paymentParams)
      .withPolicies(calcPolicy)
      .withSpecs(specs)
      .build();

    payment.post();

    await this.dataAccess.paymRepo.save(payment);

    const paymCreateEvent = ProcessPaymentEvent.create({
      paymentId: payment.id.value,
      amount: payment.paymentAmount?.amount || 0,
      currency: 'USD',
      userId: payment.userId.value,
    });
    this.eventEmitter.emit(
      Messaging.PaymentEventsEnum.PaymentProcessed,
      paymCreateEvent,
    );
    return payment;
  }
}
