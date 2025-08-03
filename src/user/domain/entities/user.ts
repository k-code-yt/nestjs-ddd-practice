import { UserId } from '../../../shared/domain/value-objects/user-id.vo';
import { ISpecification } from '../../../shared/interfaces/specification.interface';
import { Permission } from '../value-objects/permission.vo';

export enum UserTypeEnum {
  driver = 'driver',
  carrier = 'carrier',
  owner = 'owner',
}

export interface IUserParams {
  id: UserId;
  type: UserTypeEnum;
  fullName: string;
  email: string;
  permissions: Permission[];
}

export class User {
  constructor(
    private readonly params: IUserParams,
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

  public post(): this {
    this.applyIdIfMissing();
    this.ensureSpecs();
    return this;
  }

  get id(): UserId {
    return this.params.id;
  }

  get fullName() {
    return this.params.fullName;
  }

  get permissions(): Permission[] {
    return this.params.permissions;
  }

  get type(): UserTypeEnum {
    return this.params.type;
  }
}
