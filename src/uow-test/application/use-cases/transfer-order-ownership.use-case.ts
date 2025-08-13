import { Injectable } from '@nestjs/common';
import { IUnitOfWork } from '../ports/unit-of-work.interface';

@Injectable()
export class TransferOrderOwnershipUseCase {
  constructor(private unitOfWork: IUnitOfWork) {}

  async execute(orderId: string, newUserId: string): Promise<void> {
    const userRepo = this.unitOfWork.getUserRepository();
    const orderRepo = this.unitOfWork.getOrderRepository();

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

    await orderRepo.save(order);
    await userRepo.save(newOwner);
  }
}
