import { Injectable, Logger } from '@nestjs/common';
import { TransferOrderOwnershipPresenter } from '../application/use-cases/transfer-order-ownership.use-case';
import { Order } from '../domain/entities/order.entity';

@Injectable()
export class HTTPTransferOrderOwnershipPresenter
  implements TransferOrderOwnershipPresenter
{
  async update(order: Order): Promise<void> {
    Logger.debug(order, 'PRESENTER:UPDATE');
  }
  async onError(err: any): Promise<void> {
    Logger.error(err, 'PRESENTER:ERR');
  }
}
