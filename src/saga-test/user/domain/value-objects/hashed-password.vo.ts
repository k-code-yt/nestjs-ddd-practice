export class HashedPassword {
  private readonly _hash: string;
  private readonly _salt: string;

  constructor(hash: string, salt: string) {
    this.validate(hash, salt);
    this._hash = hash;
    this._salt = salt;
  }

  get hash(): string {
    return this._hash;
  }

  get salt(): string {
    return this._salt;
  }

  equals(other: HashedPassword): boolean {
    return this._hash === other._hash && this._salt === other._salt;
  }

  toString(): string {
    return '[HASHED]';
  }

  toJSON() {
    return {
      hash: this._hash,
      salt: this._salt,
    };
  }

  private validate(hash: string, salt: string): void {
    if (!hash || hash.trim().length === 0) {
      throw new Error('Password hash cannot be empty');
    }
    if (!salt || salt.trim().length === 0) {
      throw new Error('Password salt cannot be empty');
    }
  }
}
