import { IPaymentParams } from '../../domain/entities/payment';
import { PaymentCalculationPolicyFactory } from '../factories/payment-calculation-policy.factory';
import { Money } from '../../../shared/domain/value-objects/money.vo';
import { PaymentSpecificationFactory } from '../factories/specifications.factory';
import { PaymentBuilder } from '../../domain/entities/payment.builder';
import { PaymentId } from '../../../shared/domain/value-objects/payment-id.vo';
import { UserId } from '../../../shared/domain/value-objects/user-id.vo';
import { IPaymentRepo } from '../repositories/payment.repository';
import { IUserRepo } from '../repositories/user.repository';

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

export class CreatePaymentUseCase {
  constructor(
    private readonly dataAccess: IDataAccess,
    private readonly params: ICreatePaymentUseCaseParams,
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

    const paymentParams: IPaymentParams = {
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

    // TODO -> add mapper here -> for presenter layer
    return payment;
  }
}
