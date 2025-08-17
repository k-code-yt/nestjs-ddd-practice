import { EntityId } from './entity-id.vo';

export class PaymentId extends EntityId {
  private constructor(value: string) {
    super(value);
  }

  static fromString(value: string): PaymentId {
    return new PaymentId(value);
  }

  static generate(): PaymentId {
    return new PaymentId(this.generateId());
  }

  static create(value?: string): PaymentId {
    return value ? PaymentId.fromString(value) : PaymentId.generate();
  }
}
