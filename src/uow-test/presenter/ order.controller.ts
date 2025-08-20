import {
  Controller,
  Post,
  Param,
  Body,
  OnApplicationBootstrap,
  Logger,
} from '@nestjs/common';
import { TransferOrderOwnershipUseCase } from '../application/use-cases/transfer-order-ownership.use-case';
import { UserOrderUOW } from '../application/repositories/repos';

class TransferOwnershipDto {
  newUserId: string;
}

@Controller('orders')
export class OrderController implements OnApplicationBootstrap {
  constructor(private readonly uow: UserOrderUOW) {}

  async onApplicationBootstrap() {
    const userId = 'user-002';
    const proms = [
      this.transferOwnership('order-007', {
        newUserId: userId,
      }),
      this.transferOwnership('order-010', {
        newUserId: 'user-004',
      }),
      //   this.payment('user-003', 'order-005'), // maybe
      //   this.payment(userId, 'order-005'), // maybe
      //   this.payment('user-003', 'order-004'), // success
    ];
    // await Promise.all(proms);
  }

  @Post(':id/transfer-ownership')
  async transferOwnership(
    @Param('id') orderId: string,
    @Body() dto: TransferOwnershipDto,
  ) {
    try {
      const useCase = new TransferOrderOwnershipUseCase(this.uow);
      await useCase.execute(orderId, dto.newUserId);
      return { success: true };
    } catch (error) {
      Logger.error(error?.message || error?.code);
      throw new Error(error.message);
    }
  }

  @Post(':id/payment')
  async payment(@Param('id') userId: string, @Param('id') orderId: string) {
    // const useCase = new CreatePaymentUOWUseCase(this.userPaymentUOW);
    // const paymentUC = this.uowFactory.createTransactionalProxy(
    //   useCase,
    //   UserPaymentUnitOfWork,
    // );
    // await paymentUC.execute(userId, orderId);
    // return { success: true };
  }
}
