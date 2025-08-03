import { v4 as uuidv4 } from 'uuid';

export abstract class EntityId {
  constructor(protected readonly _value: string) {
    this.validateId(_value);
    this._value = _value.trim();
  }

  get value(): string {
    return this._value;
  }

  equals(other: EntityId): boolean {
    return (
      this._value === other._value && this.constructor === other.constructor
    );
  }

  toString(): string {
    return this._value;
  }

  // Static factory method for generating new UUIDs
  protected static generateId(): string {
    return uuidv4();
  }

  // Validation method that can be overridden
  protected validateId(value: string): void {
    if (!value || value.trim().length === 0) {
      throw new Error(`${this.constructor.name} cannot be empty`);
    }

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(value.trim())) {
      throw new Error(`${this.constructor.name} must be a valid UUID v4`);
    }
  }
}
