import { ISpecification } from '../../../shared/interfaces/specification.interface';
import { User, UserResourceEnum } from '../../domain/entities/user';
import { UserAuthLockedSpecification } from '../../domain/specifications/authorization.specifications';
import {
  CreateUserSpecification,
  UpdateUserSpecification,
} from '../../domain/specifications/creational.specifications';
import { WritePermissionSpecification } from '../../domain/specifications/permission.specification';
import { ResourceType } from '../../domain/value-objects/permission.vo';

export interface ISpecFactoryParams {
  lockedUntil?: Date | null;
  resource: UserResourceEnum;
}

export interface ISpecFactory {
  for(params: ISpecFactoryParams): ISpecification<User>[];
}

export class UserSpecificationFactory implements ISpecFactory {
  for(params: ISpecFactoryParams): ISpecification<User>[] {
    const specs: ISpecification<User>[] = [];

    if (params.lockedUntil) {
      specs.push(
        new UserAuthLockedSpecification({
          lockedUntil: params.lockedUntil,
        }),
      );
    }

    switch (params.resource) {
      case UserResourceEnum.userPermissions:
        specs.push(new WritePermissionSpecification(ResourceType.USER));
        break;
      case UserResourceEnum.userProfileUpdate:
        specs.push(
          new WritePermissionSpecification(ResourceType.USER),
          new UpdateUserSpecification(),
        );
        break;
      case UserResourceEnum.userCreate:
        specs.push(new CreateUserSpecification());
      default:
        break;
    }

    return specs;
  }
}
