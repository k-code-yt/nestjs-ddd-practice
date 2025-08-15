import { UserId } from '../../../shared/domain/value-objects/user-id.vo';
import { UserPermissionDto } from '../dtos/user-permission.dto';
import { UserTypeDto } from '../dtos/user-type.dto';

export abstract class IUserRepo {
  abstract getPermissions(userId: UserId): Promise<UserPermissionDto>;
  abstract getUserType(userId: UserId): Promise<UserTypeDto>;
}
