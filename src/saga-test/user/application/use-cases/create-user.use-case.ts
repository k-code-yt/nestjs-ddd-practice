import { UserResourceEnum, UserTypeEnum } from '../../domain/entities/user';
import { UserBuilder } from '../../domain/entities/user.builder';
import { Password } from '../../domain/value-objects/password.vo';
import { PasswordPolicyFactory } from '../factories/password-policy.factory';
import { UserSpecificationFactory } from '../factories/specifications.factory';
import { ISaveUserRepo } from '../repositories/user.repository';
import { DefaultPermissionPolicy } from '../../domain/policies/permissions.policy';

export interface ICreateUserUseCaseContext {
  email: string;
  fullName: string;
  password: string;
  type: UserTypeEnum;
}

interface IDataAccess {
  userRepo: ISaveUserRepo;
}

export class CreateUserUseCase {
  private readonly resource: UserResourceEnum.userCreate;

  constructor(
    private readonly context: ICreateUserUseCaseContext,
    private readonly dataAccess: IDataAccess,
  ) {}

  async execute() {
    const pwPolicy = new PasswordPolicyFactory().for({
      password: new Password(this.context.password),
    });
    // TODO -> add factory if non-default must be here
    const permishPolicy = new DefaultPermissionPolicy();

    const specs = new UserSpecificationFactory().for({
      resource: this.resource,
    });

    const user = UserBuilder.forCreation({
      email: this.context.email,
      type: this.context.type,
      fullName: this.context.fullName,
    })
      .withPasswordPolicy(pwPolicy)
      .withPermissionPolicy(permishPolicy)
      .withSpecs(specs)
      .build();

    user.create();
    await this.dataAccess.userRepo.save(user);
  }
}
