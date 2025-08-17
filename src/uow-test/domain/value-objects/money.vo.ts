export class Money {
  private readonly _cents: number;

  constructor(cents: number) {
    if (!Number.isInteger(cents)) {
      throw new Error('Amount must be an integer representing cents');
    }
    if (cents < 0) {
      throw new Error('Amount cannot be negative');
    }

    this._cents = cents;
  }

  get cents(): number {
    return this._cents;
  }

  get amount(): number {
    return this._cents / 100;
  }

  equals(other: Money): boolean {
    return this._cents === other._cents;
  }

  add(other: Money): Money {
    return new Money(this._cents + other._cents);
  }

  subtract(other: Money): Money {
    return new Money(this._cents - other._cents);
  }

  multiply(multiplier: number): Money {
    return new Money(Math.round(this._cents * multiplier));
  }

  divide(divisor: number): Money {
    if (divisor === 0) {
      throw new Error('Cannot divide by zero');
    }
    return new Money(Math.round(this._cents / divisor));
  }

  isGreaterThan(other: Money): boolean {
    return this._cents > other._cents;
  }

  isLessThan(other: Money): boolean {
    return this._cents < other._cents;
  }

  isNegative(): boolean {
    return this._cents < 0;
  }

  isZero(): boolean {
    return this._cents === 0;
  }

  toString(): string {
    return `${this.amount.toFixed(2)}`;
  }

  toJSON() {
    return {
      cents: this._cents,
      amount: this.amount,
    };
  }

  static fromDollars(dollars: number): Money {
    return new Money(Math.round(dollars * 100));
  }

  static fromCents(cents: number): Money {
    return new Money(cents);
  }
}
