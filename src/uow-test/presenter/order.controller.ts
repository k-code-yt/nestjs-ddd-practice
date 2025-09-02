import {
  Controller,
  Post,
  Param,
  Body,
  OnApplicationBootstrap,
  Logger,
} from '@nestjs/common';
import { TransferOrderOwnershipUseCase } from '../application/use-cases/transfer-order-ownership.use-case';

class TransferOwnershipDto {
  newUserId: string;
}

@Controller('orders')
export class OrderController implements OnApplicationBootstrap {
  constructor(private readonly uc: TransferOrderOwnershipUseCase) {}

  async onApplicationBootstrap() {
    // const userId = 'user-003';
    // const proms = [
    //   this.transferOwnership('order-007', {
    //     newUserId: userId,
    //   }),
    //   this.transferOwnership('order-007', {
    //     newUserId: 'user-004',
    //   }),
    //   //   this.payment('user-003', 'order-005'), // maybe
    //   //   this.payment(userId, 'order-005'), // maybe
    //   //   this.payment('user-003', 'order-004'), // success
    // ];
    // await Promise.all(proms);
  }

  @Post(':id/transfer-ownership')
  async transferOwnership(
    @Param('id') orderId: string,
    @Body() dto: TransferOwnershipDto,
  ) {
    try {
      await this.uc.execute(orderId, dto.newUserId);
      return { success: true };
    } catch (error) {
      Logger.error(error?.message || error?.code);
      throw new Error(error.message);
    }
  }
}
