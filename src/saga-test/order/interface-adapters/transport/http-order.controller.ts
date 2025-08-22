import { Controller, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Messaging } from '../../../shared/infrastructure/messaging/messaging.config';
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
        userId: '550e8400-e29b-41d4-a716-446655440001',
        chargeAmount: 1000,
      },
      this.eventEmitter,
    );
    await uc.execute();
  }
}
