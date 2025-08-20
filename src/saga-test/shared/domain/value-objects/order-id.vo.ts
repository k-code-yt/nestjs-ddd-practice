import { EntityId } from './entity-id.vo';

export class OrderId extends EntityId {
  private constructor(value: string) {
    super(value);
  }

  static fromString(value: string): OrderId {
    return new OrderId(value);
  }

  static generate(): OrderId {
    return new OrderId(this.generateId());
  }

  static create(value?: string): OrderId {
    return value ? OrderId.fromString(value) : OrderId.generate();
  }
}
