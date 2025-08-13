import { UserId } from '../../../shared/domain/value-objects/user-id.vo';
import { ISpecification } from '../../../shared/interfaces/specification.interface';
import { IHashPasswordPolicy } from '../policies/hash-password.policy';
import { IPermissionPolicy } from '../policies/permissions.policy';
import { HashedPassword } from '../value-objects/hashed-password.vo';
import { Password } from '../value-objects/password.vo';
import { Permission } from '../value-objects/permission.vo';

export enum UserResourceEnum {
  userCreate = 'userCreate',
  userProfileUpdate = 'userProfileUpdate',
  userPermissions = 'userPermissions',
}

export enum UserTypeEnum {
  driver = 'driver',
  carrier = 'carrier',
  owner = 'owner',
}

export interface IUserBuilder {
  build(): User;
}
export interface IUserParams {
  id: UserId;
  type: UserTypeEnum;
  fullName?: string;
  email: string;
  password: Password;
  permissions?: Permission[];
  lockedUntil?: Date;
  hashedPassword?: HashedPassword;
}

export interface IUserPolicies {
  password?: IHashPasswordPolicy;
  permission?: IPermissionPolicy;
}

export class User {
  constructor(
    private readonly params: IUserParams,
    private readonly policies: IUserPolicies,
    private readonly specs: ISpecification<User>[],
  ) {}

  private ensureSpecs(): void {
    for (const s of this.specs) {
      const isSatisfied = s.isSatisfiedBy(this);
      if (!isSatisfied) {
        // TODO -> add propper domain error
        throw new Error(s.reason(this));
      }
    }
  }

  public applyIdIfMissing() {
    if (!this.params.id) {
      this.params.id = UserId.create();
    }
  }

  public async applyPasswordPolicy() {
    if (this.policies.password) {
      this.params.hashedPassword = await this.policies.password?.createHashed();
    }
  }

  public async applyPermissionsPolicy() {
    if (this.policies.permission) {
      this.params.permissions = this.policies.permission.create(
        this.params.type,
      );
    }
  }

  public async create(): Promise<this> {
    this.applyIdIfMissing();
    await this.applyPasswordPolicy();
    await this.applyPermissionsPolicy();
    this.ensureSpecs();
    return this;
  }

  get id(): UserId | undefined {
    return this.params.id;
  }

  get hashedPassword(): HashedPassword | undefined {
    return this.params.hashedPassword;
  }

  get fullName(): string | undefined {
    return this.params.fullName;
  }

  get permissions(): Permission[] | undefined {
    return this.params.permissions;
  }

  get type(): UserTypeEnum {
    return this.params.type;
  }

  get email(): string {
    return this.params.email;
  }

  get lockedUntil(): Date | null {
    return this.params.lockedUntil || null;
  }
}
