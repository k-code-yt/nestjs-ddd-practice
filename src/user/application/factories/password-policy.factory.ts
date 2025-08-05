import {
  BcryptPasswordHashingPolicy,
  IHashPasswordPolicy,
} from '../../domain/policies/hash-password.policy';
import { Password } from '../../domain/value-objects/password.vo';

export interface IPasswordPolicyContext {
  password: Password;
}

export interface IPasswordPolicyFactory {
  for(context: IPasswordPolicyContext): IHashPasswordPolicy;
}

export class PasswordPolicyFactory implements IPasswordPolicyFactory {
  for(context: IPasswordPolicyContext): IHashPasswordPolicy {
    return new BcryptPasswordHashingPolicy(context?.password);
  }
}
