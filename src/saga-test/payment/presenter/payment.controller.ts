import {
  Controller,
  Logger,
  OnApplicationBootstrap,
  OnModuleInit,
} from '@nestjs/common';
import { CreatePaymentUseCase } from '../application/use-cases/create-payment.use-case';
import { IPaymentRepo } from '../application/repositories/payment.repository';
import { IUserRepo } from '../application/repositories/user.repository';
import { MessagingProducer } from '../../shared/infrastructure/messaging/messaging.interfaces';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Messaging } from '../../shared/infrastructure/messaging/messaging.config';

@Controller()
export class PaymentController implements OnApplicationBootstrap {
  constructor(
    // TODO -> remove from here
    private readonly paymRepo: IPaymentRepo,
    private readonly userRepo: IUserRepo,
    private readonly msgProducer: MessagingProducer,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async onApplicationBootstrap() {
    await this.create();
  }

  async create() {
    const uc = new CreatePaymentUseCase(
      {
        paymRepo: this.paymRepo,
        userRepo: this.userRepo,
      },
      {
        chargeAmount: 100,
        userId: '550e8400-e29b-41d4-a716-446655440001',
      },
      this.eventEmitter,
    );
    await uc.execute();
  }
}
