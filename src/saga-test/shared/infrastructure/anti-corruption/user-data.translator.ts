import { Injectable } from '@nestjs/common';
import { ExternalPermission } from '../external-services/user-service.client';
import { PaymentUserTypeEnum } from '../../../payment/application/use-cases/create-payment.use-case';
import { UserPermissionDto } from '../../../payment/application/dtos/user-permission.dto';
import { UserTypeDto } from '../../../payment/application/dtos/user-type.dto';

@Injectable()
export class UserDataTranslator {
  toPaymentUserType(externalUserType: string): UserTypeDto {
    const mapping: Record<string, PaymentUserTypeEnum> = {
      basic_user: PaymentUserTypeEnum.regular,
      premium_user: PaymentUserTypeEnum.premium,
    };

    const type = mapping[externalUserType] || PaymentUserTypeEnum.regular;
    return { type };
  }

  toPaymentPermissions(
    externalPermissions: ExternalPermission[],
    userType: string,
  ): UserPermissionDto {
    const paymentPermissions = externalPermissions.filter(
      (p) => p.resource === 'payment' || p.resource === 'all',
    );

    const isAllowedToMakePayment = this.determineCanCreatePayment(
      paymentPermissions,
      userType,
    );
    const isAllowedToUseNegative =
      this.determineCanUseNegative(paymentPermissions);

    return {
      isAllowedToMakePayment,
      isAllowedToUseNegative,
    };
  }

  private determineCanCreatePayment(
    permissions: ExternalPermission[],
    userType: string,
  ): boolean {
    if (userType === PaymentUserTypeEnum.premium) {
      return true;
    }

    return permissions.some((p) =>
      ['write', 'admin', 'payment_create'].includes(p.type),
    );
  }

  private determineCanUseNegative(permissions: ExternalPermission[]): boolean {
    return permissions.some((p) => p.type === 'payment_negative');
  }
}
