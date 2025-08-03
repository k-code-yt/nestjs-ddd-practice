import { Money } from '../../../shared/domain/value-objects/money.vo';
import { ISpecification } from '../../../shared/interfaces/specification.interface';
import { Payment } from '../../domain/entities/payment';
import {
  NegativePaymentSpecification,
  PaymentAuthorizationSpecification,
} from '../../domain/specifications/authorization-specifications';
import {
  AmountSpecification,
  StatusSpecification,
} from '../../domain/specifications/payment-specifications';
import { UserPermissionDto } from '../dtos/user-permission.dto';

export interface ISpecFactoryParams {
  userId: string;
  userPermissions: UserPermissionDto;
  chargeAmount: Money;
}

export interface ISpecFactory {
  for(params: ISpecFactoryParams): ISpecification<Payment>[];
}

export class PaymentSpecificationFactory implements ISpecFactory {
  for(params: ISpecFactoryParams): ISpecification<Payment>[] {
    const specs = [
      new AmountSpecification(),
      new StatusSpecification(),
      new PaymentAuthorizationSpecification({
        userId: params?.userId,
        userPermissions: params?.userPermissions,
      }),
    ];

    if (params.chargeAmount.isNegative()) {
      specs.push(
        new NegativePaymentSpecification({
          userId: params?.userId,
          userPermissions: params?.userPermissions,
        }),
      );
    }

    return specs;
  }
}
