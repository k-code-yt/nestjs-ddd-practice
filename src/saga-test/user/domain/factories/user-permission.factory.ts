import { UserTypeEnum } from '../entities/user';
import {
  Permission,
  ResourceType,
  PermissionType,
} from '../value-objects/permission.vo';

export interface IUserPermissionFactory {
  for(userType: UserTypeEnum): Permission[];
}

export class UserPermissionFactory implements IUserPermissionFactory {
  for(userType: UserTypeEnum): Permission[] {
    switch (userType) {
      case UserTypeEnum.owner:
        return this.getAdminPermissions();
      case UserTypeEnum.carrier:
        return this.getPremiumPermissions();
      default:
      case UserTypeEnum.driver:
        return this.getBasicPermissions();
    }
  }

  private getAdminPermissions(): Permission[] {
    return Object.entries(ResourceType).map(
      (rt) => new Permission(PermissionType.ADMIN, rt[1]),
    );
  }

  private getPremiumPermissions(): Permission[] {
    return [
      new Permission(PermissionType.WRITE, ResourceType.USER),
      new Permission(PermissionType.WRITE, ResourceType.PAYMENT),
    ];
  }

  private getBasicPermissions(): Permission[] {
    return [
      new Permission(PermissionType.WRITE, ResourceType.USER),
      new Permission(PermissionType.READ, ResourceType.PAYMENT),
    ];
  }
}
