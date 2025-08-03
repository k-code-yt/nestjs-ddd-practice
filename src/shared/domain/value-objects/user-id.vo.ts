import { EntityId } from './entity-id.vo';

export class UserId extends EntityId {
  private constructor(value: string) {
    super(value);
  }

  static fromString(value: string): UserId {
    return new UserId(value);
  }

  static generate(): UserId {
    return new UserId(this.generateId());
  }

  static create(value?: string): UserId {
    return value ? UserId.fromString(value) : UserId.generate();
  }
}
