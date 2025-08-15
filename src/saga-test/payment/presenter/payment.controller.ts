import { Controller, OnModuleInit } from '@nestjs/common';
import { CreatePaymentUseCase } from '../application/use-cases/create-payment.use-case';
import { IPaymentRepo } from '../application/repositories/payment.repository';
import { IUserRepo } from '../application/repositories/user.repository';
import { MessagingProducer } from '../../shared/infrastructure/messaging/messaging.interfaces';

// TODOs
// test consumer
// add handler that will emmit events
// where to publish/consumer from -> infra -> emmit event -> tranport

@Controller()
export class PaymentController implements OnModuleInit {
  constructor(
    // TODO -> remove from here
    private readonly paymRepo: IPaymentRepo,
    private readonly userRepo: IUserRepo,
    private readonly msgProducer: MessagingProducer,
  ) {}

  async onModuleInit() {
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
      this.msgProducer,
    );
    await uc.execute();
  }
}
