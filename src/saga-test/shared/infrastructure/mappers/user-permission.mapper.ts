import { UserPermissionDto } from '../../../payment/application/dtos/user-permission.dto';
import {
  Permission,
  ResourceType,
  PermissionType,
} from '../../../user/domain/value-objects/permission.vo';
export class UserPermissionMapper {
  static toPaymentPermissionDto(permissions: Permission[]): UserPermissionDto {
    const paymentPermissions = permissions.filter(
      (p) => p.resourceType === ResourceType.PAYMENT,
    );

    const hasWritePermission = paymentPermissions.some(
      (p) =>
        p.permission === PermissionType.WRITE ||
        p.permission === PermissionType.ADMIN,
    );

    const hasAdminPermission = paymentPermissions.some(
      (p) => p.permission === PermissionType.ADMIN,
    );

    return {
      isAllowedToMakePayment: hasWritePermission,
      isAllowedToUseNegative: hasAdminPermission,
    };
  }
}
