import { IUserPaymentUnitOfWork } from '../../application/ports/unit-of-work.interface';
import { CreatePaymentUOWUseCase } from '../../application/use-cases/create-payment.use-case';
import { ProxyUnitOfWorkFactory } from '../persistence/proxy-unit-of-work';
import { UserPaymentUnitOfWork } from '../persistence/uow/user-payment.uow';

export const UserPaymentUseCaseProvider = {
  provide: CreatePaymentUOWUseCase,
  useFactory: async (
    unitOfWork: IUserPaymentUnitOfWork,
    proxyFactory: ProxyUnitOfWorkFactory,
  ) => {
    const useCase = new CreatePaymentUOWUseCase(unitOfWork);
    return proxyFactory.createTransactionalProxy(
      useCase,
      UserPaymentUnitOfWork,
    );
  },
  inject: [UserPaymentUnitOfWork.INJECTION_TOKEN, ProxyUnitOfWorkFactory],
};
