import { ISpecification } from '../../../shared/interfaces/specification.interface';
import { Payment } from '../entities/payment';

export interface IUserPaymentPermissions {
  isAllowedToMakePayment: boolean;
  isAllowedToUseNegative: boolean;
}

export interface IPaymentAuthorizationContext {
  userId: string;
  userPermissions: IUserPaymentPermissions;
}

export class PaymentAuthorizationSpecification
  implements ISpecification<Payment>
{
  constructor(private readonly authContext: IPaymentAuthorizationContext) {
    this.validateAuthContext(authContext);
  }

  isSatisfiedBy(candidate: Payment): boolean {
    return this.authContext.userPermissions.isAllowedToMakePayment;
  }

  reason(candidate: Payment): string {
    return `User ${this.authContext.userId} does not have permissions to create payments.`;
  }

  private validateAuthContext(authContext: IPaymentAuthorizationContext): void {
    if (!authContext.userId) {
      throw new Error('User ID is required for payment authorization');
    }
    if (!authContext.userPermissions) {
      throw new Error(
        'User permissions are required for payment authorization',
      );
    }
  }
}

export class NegativePaymentSpecification implements ISpecification<Payment> {
  constructor(private readonly authContext: IPaymentAuthorizationContext) {
    this.validateAuthContext(authContext);
  }

  isSatisfiedBy(candidate: Payment): boolean {
    return this.authContext.userPermissions.isAllowedToUseNegative;
  }

  reason(candidate: Payment): string {
    return `User ${this.authContext.userId} does not have required permissions to create negative payments.`;
  }

  private validateAuthContext(authContext: IPaymentAuthorizationContext): void {
    if (!authContext.userId) {
      throw new Error('User ID is required for payment authorization');
    }
    if (!authContext.userPermissions) {
      throw new Error(
        'User permissions are required for payment authorization',
      );
    }
  }
}
