import { Permission } from '../value-objects/permission.vo';
import { UserTypeEnum } from '../entities/user';
import { UserPermissionFactory } from '../factories/user-permission.factory';

export interface IPermissionPolicy {
  create(userType: UserTypeEnum): Permission[];
}

export class DefaultPermissionPolicy implements IPermissionPolicy {
  create(userType: UserTypeEnum): Permission[] {
    return new UserPermissionFactory().for(userType);
  }
}
