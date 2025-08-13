import { UserId } from '../../../shared/domain/value-objects/user-id.vo';
import { ISpecification } from '../../../shared/interfaces/specification.interface';
import {
  IPaymentParams,
  ICalculationPolicy,
  IPaymentBuilder,
  Payment,
} from './payment';

export class PaymentBuilder implements IPaymentBuilder {
  private params: Pick<
    IPaymentParams,
    'chargeAmount' | 'paymentAmount' | 'status' | 'userId'
  >;
  private calculationPolicy: ICalculationPolicy;
  private specs: ISpecification<Payment>[];

  withParams(
    p: Pick<
      IPaymentParams,
      'chargeAmount' | 'paymentAmount' | 'status' | 'userId'
    >,
  ) {
    this.params = p;
    return this;
  }

  withPolicies(c: ICalculationPolicy) {
    this.calculationPolicy = c;
    return this;
  }

  withSpecs(s: ISpecification<Payment>[]) {
    this.specs = s;
    return this;
  }

  build(): Payment {
    return new Payment(
      this.params as IPaymentParams,
      this.calculationPolicy,
      this.specs,
    );
  }
}
