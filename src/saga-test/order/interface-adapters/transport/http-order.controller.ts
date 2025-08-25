import { Controller, OnApplicationBootstrap } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  CreateOrderUseCase,
  CreateOrderDataAccess,
} from '../../use-cases/create-order.use-case';

@Controller()
export class HTTPOrderTransport implements OnApplicationBootstrap {
  constructor(
    private readonly createDataAccess: CreateOrderDataAccess,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async onApplicationBootstrap() {
    await this.create();
  }

  async create() {
    const uc = new CreateOrderUseCase(
      this.createDataAccess,
      {
        userId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        chargeAmount: 1000,
      },
      this.eventEmitter,
    );
    await uc.execute();
  }
}
