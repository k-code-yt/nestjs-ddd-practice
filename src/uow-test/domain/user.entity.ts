import { Order } from './order.entity';

export class User {
  constructor(
    private _id: string,
    private _email: string,
    private _name: string,
    private _orders: Order[] = [],
  ) {}

  get id(): string {
    return this._id;
  }

  get email(): string {
    return this._email;
  }

  get name(): string {
    return this._name;
  }

  get orders(): Order[] {
    return [...this._orders];
  }

  addOrder(order: Order): void {
    if (!this._orders.find((o) => o.id === order.id)) {
      this._orders.push(order);
    }
  }

  removeOrder(orderId: string): void {
    this._orders = this._orders.filter((o) => o.id !== orderId);
  }
}
