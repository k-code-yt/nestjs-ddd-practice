import { Controller, Post, Param, Body } from '@nestjs/common';
import { TransferOrderOwnershipUseCase } from '../application/use-cases/transfer-order-ownership.use-case';
import { CreatePaymentUOWUseCase } from '../application/use-cases/create-payment.use-case';

class TransferOwnershipDto {
  newUserId: string;
}

@Controller('orders')
export class OrderController {
  constructor(
    private readonly transferUC: TransferOrderOwnershipUseCase,
    private readonly paymentUC: CreatePaymentUOWUseCase,
  ) {}

  async onModuleInit() {
    const userId = 'user-002';
    const proms = [
      this.transferOwnership('order-001', {
        newUserId: userId,
      }),
      this.transferOwnership('order-009', {
        newUserId: userId,
      }),
      this.payment(userId),
    ];
    await Promise.all(proms);
  }

  @Post(':id/transfer-ownership')
  async transferOwnership(
    @Param('id') orderId: string,
    @Body() dto: TransferOwnershipDto,
  ) {
    await this.transferUC.execute(orderId, dto.newUserId);
    return { success: true };
  }

  @Post(':id/payment')
  async payment(@Param('id') userId: string) {
    await this.paymentUC.execute(userId);
    return { success: true };
  }
}
