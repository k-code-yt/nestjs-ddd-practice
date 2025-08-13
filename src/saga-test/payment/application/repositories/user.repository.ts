import { UserId } from '../../../shared/domain/value-objects/user-id.vo';
import { UserPermissionDto } from '../dtos/user-permission.dto';
import { UserTypeDto } from '../dtos/user-type.dto';

export interface IUserRepo {
  getPermissions(userId: UserId): Promise<UserPermissionDto>;
  getUserType(userId: UserId): Promise<UserTypeDto>;
}
