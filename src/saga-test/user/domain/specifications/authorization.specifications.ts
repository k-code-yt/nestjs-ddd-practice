import { ISpecification } from '../../../saga-test/shared/interfaces/specification.interface';
import { User } from '../entities/user';

export interface IUserAuthLockedContext {
  lockedUntil: Date;
}

export class UserAuthLockedSpecification implements ISpecification<User> {
  constructor(private readonly authContext: IUserAuthLockedContext) {}

  isSatisfiedBy(candidate: User): boolean {
    return (
      this.authContext.lockedUntil &&
      this.authContext.lockedUntil.getTime() < new Date().getTime()
    );
  }

  reason(candidate: User): string {
    throw new Error(
      `User has reached maximum login attempts. Please try again after ${this.authContext.lockedUntil.toUTCString()}`,
    );
  }
}
