import { PaymentCalculationPolicyFactory } from '../factories/payment-calculation-policy.factory';
import { Money } from '../../../shared/domain/value-objects/money.vo';
import { PaymentSpecificationFactory } from '../factories/specifications.factory';
import { PaymentBuilder } from '../../domain/entities/payment.builder';
import { PaymentId } from '../../../shared/domain/value-objects/payment-id.vo';
import { UserId } from '../../../shared/domain/value-objects/user-id.vo';
import { IPaymentRepo } from '../repositories/payment.repository';
import { IUserRepo } from '../repositories/user.repository';
import { MessagingProducer } from '../../../shared/infrastructure/messaging/messaging.interfaces';
import { Messaging } from '../../../shared/infrastructure/messaging/messaging.config';
import { ProcessPaymentCommand } from '../commands/payment-processed.command';
import { IPaymentInput } from '../../domain/entities/payment';

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
    private readonly msgService: MessagingProducer,
  ) {}

  async execute() {
    // await this.msgService.produce(
    //   { msg: 'test' },
    //   Messaging.SagaEventsEnum.OrderPaymentSagaStarted,
    // );

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
    // TODO -> add mapping to needed data
    // Add saga ID
    await this.msgService.produce(
      ProcessPaymentCommand.create({
        paymentId: payment.id.value,
        amount: payment.paymentAmount?.amount || 0,
        currency: 'USD',
        userId: payment.userId.value,
      }),
      Messaging.PaymentEventsEnum.PaymentProcessed,
    );
    // TODO -> add mapper here -> for presenter layer
    return payment;
  }
}
