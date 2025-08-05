export class Password {
  private readonly _value: string;

  constructor(value: string) {
    this.validate(value);
    this._value = value;
  }

  get value(): string {
    return this._value;
  }

  equals(other: Password): boolean {
    return this._value === other._value;
  }

  getStrength(): 'weak' | 'medium' | 'strong' {
    if (this._value.length < 8) return 'weak';
    if (this._value.length >= 12 && this.hasComplexCharacters())
      return 'strong';
    return 'medium';
  }

  toString(): string {
    return '*'.repeat(this._value.length);
  }

  private validate(value: string): void {
    if (!value) {
      throw new Error('Password cannot be empty');
    }
    if (value.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }
    if (value.length > 128) {
      throw new Error('Password cannot exceed 128 characters');
    }
  }

  private hasComplexCharacters(): boolean {
    const hasUpperCase = /[A-Z]/.test(this._value);
    const hasLowerCase = /[a-z]/.test(this._value);
    const hasNumbers = /\d/.test(this._value);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(this._value);

    return (
      [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChars].filter(Boolean)
        .length >= 3
    );
  }
}
