import { ISpecification } from '../../../shared/interfaces/specification.interface';
import {
  ICalculationPolicy,
  IPaymentBuilder,
  IPaymentProps,
  Payment,
} from './payment';

export class PaymentBuilder implements IPaymentBuilder {
  private params: IPaymentProps;
  private calculationPolicy: ICalculationPolicy;
  private specs: ISpecification<Payment>[];

  withParams(p: IPaymentProps) {
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
    return new Payment(this.params, this.calculationPolicy, this.specs);
  }
}
