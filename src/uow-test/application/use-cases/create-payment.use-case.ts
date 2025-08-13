import { Injectable } from '@nestjs/common';
import { IUserPaymentUnitOfWork } from '../ports/unit-of-work.interface';
import { PaymentStatusEnum } from '../../../payment/domain/entities/payment';
import { PaymentBuilder } from '../../../payment/domain/entities/payment.builder';
import { UserId } from '../../../shared/domain/value-objects/user-id.vo';
import { Money } from '../../../shared/domain/value-objects/money.vo';

@Injectable()
export class CreatePaymentUOWUseCase {
  constructor(private unitOfWork: IUserPaymentUnitOfWork) {}

  async execute(userId: string): Promise<void> {
    const userRepo = this.unitOfWork.getUserRepository();
    const paymentRepo = this.unitOfWork.getPaymentRepository();

    const user = await userRepo.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const payment = new PaymentBuilder()
      .withParams({
        chargeAmount: Money.fromDollars(Math.floor(Math.random() * 1000)),
        paymentAmount: Money.fromDollars(Math.floor(Math.random() * 500)),
        userId: UserId.fromString(userId),
        status: PaymentStatusEnum.active,
      })
      .build();

    payment.post();

    await paymentRepo.save(payment);
  }
}
