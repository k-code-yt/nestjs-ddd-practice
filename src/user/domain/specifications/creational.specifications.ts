import { ISpecification } from '../../../shared/interfaces/specification.interface';
import { User } from '../entities/user';

export class CreateUserSpecification implements ISpecification<User> {
  isSatisfiedBy(candidate: User): boolean {
    return !!(
      candidate.id &&
      candidate.email &&
      candidate.fullName &&
      candidate.type &&
      candidate.hashedPassword
    );
  }

  reason(candidate: User): string {
    return 'User creation requires: id, email, fullName, type, and password';
  }
}

export class UpdateUserSpecification implements ISpecification<User> {
  isSatisfiedBy(candidate: User): boolean {
    return !!(candidate.id && candidate.email);
  }

  reason(candidate: User): string {
    return 'User update requires: id and email';
  }
}
