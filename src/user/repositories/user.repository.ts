import { UserId } from '../../shared/domain/value-objects/user-id.vo';
import { User } from '../domain/entities/user';

export interface IUserRepository {
  save(user: User): Promise<void>;
  findById(id: UserId): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
}
