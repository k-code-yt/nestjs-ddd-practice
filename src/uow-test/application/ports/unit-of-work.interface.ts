import {
  IUserRepository,
  IOrderRepository,
  IPaymentRepository,
} from '../repositories/repos';

export interface IUnitOfWork {
  getUserRepository(): IUserRepository;
  getOrderRepository(): IOrderRepository;
}

export interface IUserPaymentUnitOfWork {
  getUserRepository(): IUserRepository;
  getPaymentRepository(): IPaymentRepository;
}
