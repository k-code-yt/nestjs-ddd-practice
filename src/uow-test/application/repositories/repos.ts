import { Order } from '../../domain/entities/order.entity';
import { Payment } from '../../domain/entities/payment.entity';
import { User } from '../../domain/entities/user.entity';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<void>;
  findByEmail(email: string): Promise<User | null>;
}

export interface IOrderRepository {
  findById(id: string): Promise<Order | null>;
  save(order: Order): Promise<void>;
}

export interface IPaymentRepository {
  findById(id: string): Promise<Payment | null>;
  save(payment: Payment): Promise<void>;
}

export abstract class UserOrderUOWForModule {
  abstract getUserRepository(): IUserRepository;
  abstract getOrderRepository(): IOrderRepository;
  abstract commit(): Promise<void>;
  abstract rollback(): Promise<void>;
  abstract release(): Promise<void>;
  abstract init(): Promise<void>;
}

export abstract class UserOrderDataAccess {
  abstract getUserRepository(): IUserRepository;
  abstract getOrderRepository(): IOrderRepository;
}
