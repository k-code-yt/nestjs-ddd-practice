import { Controller, Post, Param, Body, Inject } from '@nestjs/common';
import { TransferOrderOwnershipUseCase } from '../application/use-cases/transfer-order-ownership.use-case';
import { CreatePaymentUOWUseCase } from '../application/use-cases/create-payment.use-case';
import { ProxyUnitOfWorkFactory } from '../infrastructure/persistence/uow/proxy-unit-of-work';
import {
  IUnitOfWork,
  IUserPaymentUnitOfWork,
} from '../application/ports/unit-of-work.interface';
import { UserOrderUnitOfWork } from '../infrastructure/persistence/uow/user-order.uow';
import { UserPaymentUnitOfWork } from '../infrastructure/persistence/uow/user-payment.uow';

class TransferOwnershipDto {
  newUserId: string;
}

@Controller('orders')
export class OrderController {
  constructor(
    @Inject(UserOrderUnitOfWork.INJECTION_TOKEN)
    private readonly userOrderUOW: IUnitOfWork,
    @Inject(UserPaymentUnitOfWork.INJECTION_TOKEN)
    private readonly userPaymentUOW: IUserPaymentUnitOfWork,
    private readonly uowFactory: ProxyUnitOfWorkFactory,
  ) {}

  async onModuleInit() {
    const userId = 'user-001';
    const proms = [
      this.transferOwnership('order-001', {
        newUserId: userId,
      }),
      this.transferOwnership('order-005', {
        newUserId: userId,
      }),
      this.payment('user-003', 'order-005'), // maybe
      this.payment(userId, 'order-005'), // maybe
      this.payment('user-003', 'order-004'), // success
    ];
    // await Promise.all(proms);
  }

  @Post(':id/transfer-ownership')
  async transferOwnership(
    @Param('id') orderId: string,
    @Body() dto: TransferOwnershipDto,
  ) {
    const useCase = new TransferOrderOwnershipUseCase(this.userOrderUOW);
    const transferUC = this.uowFactory.createTransactionalProxy(
      useCase,
      UserOrderUnitOfWork,
    );
    await transferUC.execute(orderId, dto.newUserId);
    return { success: true };
  }

  @Post(':id/payment')
  async payment(@Param('id') userId: string, @Param('id') orderId: string) {
    const useCase = new CreatePaymentUOWUseCase(this.userPaymentUOW);
    const paymentUC = this.uowFactory.createTransactionalProxy(
      useCase,
      UserPaymentUnitOfWork,
    );

    await paymentUC.execute(userId, orderId);
    return { success: true };
  }
}
