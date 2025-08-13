import * as bcrypt from 'bcrypt';
import { HashedPassword } from '../value-objects/hashed-password.vo';
import { Password } from '../value-objects/password.vo';

export interface IHashPasswordPolicy {
  createHashed(): Promise<HashedPassword>;
}

export class BcryptPasswordHashingPolicy implements IHashPasswordPolicy {
  private readonly saltRounds: number = 12;
  constructor(private readonly password: Password) {}

  async createHashed(): Promise<HashedPassword> {
    const salt = await bcrypt.genSalt(this.saltRounds);
    const hash = await bcrypt.hash(this.password.value, salt);

    return new HashedPassword(hash, salt);
  }
}
