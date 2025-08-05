import { UserResourceEnum, UserTypeEnum } from '../../domain/entities/user';
import { UserBuilder } from '../../domain/entities/user.builder';
import { UserSpecificationFactory } from '../factories/specifications.factory';
import { IUpdateUserRepo } from '../repositories/user.repository';
import { UserId } from '../../../shared/domain/value-objects/user-id.vo';

export interface IUpdateUserProfileUseCaseContext {
  id: string;
  fullName?: string;
  type?: UserTypeEnum;
}

interface IDataAccess {
  userRepo: IUpdateUserRepo;
}

export class UpdateUserProfileUseCase {
  private readonly resource: UserResourceEnum.userProfileUpdate;

  constructor(
    private readonly context: IUpdateUserProfileUseCaseContext,
    private readonly dataAccess: IDataAccess,
  ) {}

  async execute() {
    const userId = UserId.fromString(this.context.id);
    const dbUser = await this.dataAccess.userRepo.findById(userId);

    const specs = new UserSpecificationFactory().for({
      resource: this.resource,
      lockedUntil: dbUser?.lockedUntil,
    });

    const user = UserBuilder.forProfileUpdate({
      id: userId,
      type: this.context?.type,
      fullName: this.context?.fullName,
    })
      .withSpecs(specs)
      .build();

    user.create();
    await this.dataAccess.userRepo.update(user);
  }
}
