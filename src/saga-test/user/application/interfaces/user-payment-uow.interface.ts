import { IPaymentRepo } from '../repositories/payment.repository';
import { IUpdateUserRepo } from '../repositories/user.repository';

export interface IUserPaymentUnitOfWork {
  users: IUpdateUserRepo;
  payments: IPaymentRepo;
}
