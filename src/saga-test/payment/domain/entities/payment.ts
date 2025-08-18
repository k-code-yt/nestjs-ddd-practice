import { ISpecification } from '../../../shared/interfaces/specification.interface';
import { Money } from '../../../shared/domain/value-objects/money.vo';
import { UserId } from '../../../shared/domain/value-objects/user-id.vo';
import { PaymentId } from '../../../shared/domain/value-objects/payment-id.vo';

export enum PaymentStatusEnum {
  active = 'active',
  pending = 'pending',
  paid = 'paid',
  archived = 'archived',
  failed = 'failed',
}

export interface ICalculationPolicy {
  calculatePayment(amount: Money): Money;
}

export type IPaymentInput = Pick<IPaymentProps, 'chargeAmount' | 'userId'> &
  Partial<Pick<IPaymentProps, 'id'>>;

export interface IPaymentProps {
  id: PaymentId;
  userId: UserId;
  chargeAmount: Money;
  paymentAmount: Money | undefined;
  status: PaymentStatusEnum;
}

export interface IPaymentBuilder {
  build(): Payment;
}

export class Payment {
  private props: IPaymentProps;
  constructor(
    private readonly inputParams: IPaymentInput,
    private readonly calculationPolicy: ICalculationPolicy,
    private readonly specs: ISpecification<Payment>[],
  ) {
    this.props = { ...inputParams } as IPaymentProps;
  }

  private ensureSpecs(): void {
    if (this.specs?.length > 0) {
      for (const s of this.specs) {
        const isSatisfied = s.isSatisfiedBy(this);
        if (!isSatisfied) {
          // TODO -> add propper domain error
          throw new Error(s.reason(this));
        }
      }
    }
  }

  private applyCalculationPolicy(): this {
    if (this.calculationPolicy) {
      this.props.paymentAmount = this.calculationPolicy.calculatePayment(
        this.inputParams.chargeAmount,
      );
    }
    return this;
  }

  public applyIdIfMissing() {
    if (!this.inputParams.id) {
      this.props.id = PaymentId.create();
    }
  }

  public post(): this {
    this.props.status = PaymentStatusEnum.active;
    this.applyIdIfMissing();
    this.applyCalculationPolicy();
    // this.ensureSpecs();
    return this;
  }

  get chargeAmount(): Money {
    return this.props.chargeAmount;
  }

  set chargeAmount(amount: Money) {
    this.props.chargeAmount = amount;
  }

  get paymentAmount(): Money {
    return this.props.paymentAmount as Money;
  }

  get status(): PaymentStatusEnum {
    return this.props.status;
  }

  set status(status: PaymentStatusEnum) {
    this.props.status = status;
  }

  get id(): PaymentId {
    return this.props.id;
  }

  get userId(): UserId {
    return this.props.userId;
  }
}
