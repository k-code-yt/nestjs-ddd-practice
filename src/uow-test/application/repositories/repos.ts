import { Payment } from '../../../saga-test/payment/domain/entities/payment';
import { Order } from '../../domain/order.entity';
import { User } from '../../domain/user.entity';

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
