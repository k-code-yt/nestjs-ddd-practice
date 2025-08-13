import { UserId } from '../../../shared/domain/value-objects/user-id.vo';
import { UserPermissionDto } from '../../application/dtos/user-permission.dto';
import { UserTypeDto } from '../../application/dtos/user-type.dto';

export abstract class UserDataService {
  abstract validateUserExists(userId: UserId): Promise<boolean>;
  abstract getPermissions(userId: UserId): Promise<UserPermissionDto>;
  abstract getUserType(userId: UserId): Promise<UserTypeDto>;
}
