import { Injectable, NotAcceptableException } from '@nestjs/common';
import { IUserPaymentUnitOfWork } from '../ports/unit-of-work.interface';
import { Money } from '../../domain/value-objects/money.vo';
import { UserId } from '../../domain/value-objects/user-id.vo';
import {
  Payment,
  PaymentStatusEnum,
} from '../../domain/entities/payment.entity';
import { OrderId } from '../../domain/value-objects/order-id.vo';
import { PaymentId } from '../../domain/value-objects/payment-id.vo';

@Injectable()
export class CreatePaymentUOWUseCase {
  constructor(private unitOfWork: IUserPaymentUnitOfWork) {}

  async execute(userId: string, orderId: string): Promise<void> {
    const userRepo = this.unitOfWork.getUserRepository();
    const paymentRepo = this.unitOfWork.getPaymentRepository();
    const orderRepo = this.unitOfWork.getOrderRepository();

    const user = await userRepo.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    const order = await orderRepo.findById(orderId);
    if (!order) {
      throw new Error('order not found');
    }

    if (order.userId !== user.id) {
      throw new NotAcceptableException(
        `DIFFERENT OWNERS | order_user: ${order.userId}, user: ${userId}`,
      );
    }

    const payment = new Payment({
      chargeAmount: Money.fromDollars(Math.floor(Math.random() * 1000)),
      paymentAmount: Money.fromDollars(Math.floor(Math.random() * 500)),
      userId: UserId.fromString(userId),
      orderId: OrderId.fromString(orderId),
      id: PaymentId.create(),
      status: PaymentStatusEnum.active,
    });

    payment.post();

    await paymentRepo.save(payment);
  }
}
