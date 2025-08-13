import { User } from './user.entity';

export class Order {
  constructor(
    private _id: string,
    private _description: string,
    private _amount: number,
    private _userId: string,
  ) {}

  get id(): string {
    return this._id;
  }

  get description(): string {
    return this._description;
  }

  get amount(): number {
    return this._amount;
  }

  get userId(): string {
    return this._userId;
  }

  set userId(id: string) {
    this._userId = id;
  }

  transferOwnership(newOwner: User): void {
    this._userId = newOwner.id;
  }
}
