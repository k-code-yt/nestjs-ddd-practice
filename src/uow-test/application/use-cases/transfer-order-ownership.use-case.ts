import { Injectable } from '@nestjs/common';
import { UserOrderDataAccess } from '../repositories/repos';
import { Order } from '../../domain/entities/order.entity';

export abstract class TransferOrderOwnershipPresenter {
  abstract update(order: Order): Promise<void>;
  abstract onError(err: any): Promise<void>;
}

@Injectable()
export class TransferOrderOwnershipUseCase {
  constructor(
    private readonly dataAccess: UserOrderDataAccess,
    private readonly presenter: TransferOrderOwnershipPresenter,
  ) {}

  async execute(orderId: string, newUserId: string): Promise<void> {
    try {
      const userRepo = this.dataAccess.getUserRepository();
      const orderRepo = this.dataAccess.getOrderRepository();

      const newOwner = await userRepo.findById(newUserId);
      if (!newOwner) {
        throw new Error('User not found');
      }

      const order = await orderRepo.findById(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      order.userId = newUserId;
      newOwner.addOrder(order);

      await userRepo.save(newOwner);
      // await new Promise((res) => {
      //   setTimeout(() => {
      //     res(true);
      //   }, 2000);
      // });
      await orderRepo.save(order);
      this.presenter.update(order);
    } catch (err) {
      this.presenter.onError(err);
    }
  }
}
