import { UserId } from '../../../shared/domain/value-objects/user-id.vo';
import { User } from '../../domain/entities/user';

interface IFindedUserRepo {
  findById(id: UserId): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
}

export interface ISaveUserRepo extends IFindedUserRepo {
  save(user: User): Promise<void>;
}

export interface IUpdateUserRepo extends IFindedUserRepo {
  update(user: User): Promise<void>;
}

