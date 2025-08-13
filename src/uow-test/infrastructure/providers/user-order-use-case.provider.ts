import { IUnitOfWork } from '../../application/ports/unit-of-work.interface';
import { TransferOrderOwnershipUseCase } from '../../application/use-cases/transfer-order-ownership.use-case';
import { ProxyUnitOfWorkFactory } from '../persistence/proxy-unit-of-work';
import { UserOrderUnitOfWork } from '../persistence/uow/user-order.uow';

export const UserOrderUseCaseProvider = {
  provide: TransferOrderOwnershipUseCase,
  useFactory: async (
    unitOfWork: IUnitOfWork,
    proxyFactory: ProxyUnitOfWorkFactory,
  ) => {
    const useCase = new TransferOrderOwnershipUseCase(unitOfWork);
    return proxyFactory.createTransactionalProxy(useCase, UserOrderUnitOfWork);
  },
  inject: [UserOrderUnitOfWork.INJECTION_TOKEN, ProxyUnitOfWorkFactory],
};
