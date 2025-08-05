import { ISpecification } from '../../../shared/interfaces/specification.interface';
import { IHashPasswordPolicy } from '../policies/hash-password.policy';
import { IPermissionPolicy } from '../policies/permissions.policy';
import { IUserBuilder, IUserParams, User } from './user';

export class UserBuilder implements IUserBuilder {
  private params: Partial<IUserParams>;
  private passwordPolicy: IHashPasswordPolicy;
  private permissionPolicy: IPermissionPolicy;
  private specs: ISpecification<User>[];

  withParams(p: Partial<IUserParams>) {
    this.params = p;
    return this;
  }

  withSpecs(s: ISpecification<User>[]) {
    this.specs = s;
    return this;
  }

  withPasswordPolicy(pol: IHashPasswordPolicy) {
    this.passwordPolicy = pol;
    return this;
  }

  withPermissionPolicy(pol: IPermissionPolicy) {
    this.permissionPolicy = pol;
    return this;
  }

  static forCreation(
    params: Pick<IUserParams, 'email' | 'type' | 'fullName'>,
  ): UserBuilder {
    return new UserBuilder().withParams(params);
  }

  static forProfileUpdate(
    existingUser: Pick<IUserParams, 'id'> &
      Partial<Pick<IUserParams, 'type' | 'fullName'>>,
  ): UserBuilder {
    return new UserBuilder().withParams({
      id: existingUser.id,
      fullName: existingUser.fullName,
      type: existingUser.type,
    });
  }

  static forPermissionUpdate(
    existingUser: Pick<IUserParams, 'id'> &
      Partial<Pick<IUserParams, 'permissions'>>,
  ): UserBuilder {
    return new UserBuilder().withParams({
      id: existingUser.id,
      permissions: existingUser.permissions,
    });
  }

  build(): User {
    return new User(
      this.params as IUserParams,
      {
        password: this.passwordPolicy,
        permission: this.permissionPolicy,
      },
      this.specs,
    );
  }
}
