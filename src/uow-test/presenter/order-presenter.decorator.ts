import { UserOrderUOWForModule } from '../application/repositories/repos';
import { TransferOrderOwnershipPresenter } from '../application/use-cases/transfer-order-ownership.use-case';

export class TransactionalPresenterDecorator
  implements TransferOrderOwnershipPresenter
{
  constructor(
    private readonly presenter: TransferOrderOwnershipPresenter,
    private readonly uow: UserOrderUOWForModule,
  ) {}

  async update(args: any): Promise<void> {
    await this.uow.commit();
    await this.presenter.update(args);
  }

  async onError(args: any): Promise<void> {
    await this.uow.rollback();
    await this.presenter.onError(args);
  }
}
