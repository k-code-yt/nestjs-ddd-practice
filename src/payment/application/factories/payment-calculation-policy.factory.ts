import { ICalculationPolicy } from '../../domain/entities/payment';
import {
  DefaultCalculationPolicy,
  PremiumCalculationPolicy,
} from '../../domain/policies/calculation.policy';
import { PaymentUserTypeEnum } from '../use-cases/create-payment.use-case';

export interface IPaymentCalculationPolicyFactoryParams {
  userType: PaymentUserTypeEnum;
}

export interface IPaymentCalculationPolicyFactory {
  for(params: IPaymentCalculationPolicyFactoryParams): ICalculationPolicy;
}

export class PaymentCalculationPolicyFactory
  implements IPaymentCalculationPolicyFactory
{
  public for(
    params: IPaymentCalculationPolicyFactoryParams,
  ): ICalculationPolicy {
    switch (params.userType) {
      case PaymentUserTypeEnum.premium:
        return new PremiumCalculationPolicy();
      case PaymentUserTypeEnum.regular:
      default:
        return new DefaultCalculationPolicy();
    }
  }
}
