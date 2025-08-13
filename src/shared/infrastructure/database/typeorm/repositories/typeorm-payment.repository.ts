import { Injectable } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { IPaymentRepo } from '../../../../../payment/application/repositories/payment.repository';
import {
  ICalculationPolicy,
  IPaymentParams,
  Payment,
  PaymentStatusEnum,
} from '../../../../../payment/domain/entities/payment';
import { PaymentId } from '../../../../domain/value-objects/payment-id.vo';
import { TypeOrmPayment } from '../entities/typeorm-payment';
import { UserId } from '../../../../domain/value-objects/user-id.vo';
import { TypeOrmUser } from '../entities/typeorm-user';
import { Money } from '../../../../domain/value-objects/money.vo';
import { PaymentBuilder } from '../../../../../payment/domain/entities/payment.builder';
import { DefaultCalculationPolicy } from '../../../../../payment/domain/policies/calculation.policy';
import { ISpecification } from '../../../../interfaces/specification.interface';
import {
  AmountSpecification,
  StatusSpecification,
} from '../../../../../payment/domain/specifications/payment.specifications';

@Injectable()
export class TypeOrmPaymentRepository implements IPaymentRepo {
  private paymRepo: Repository<TypeOrmPayment>;
  constructor(
    @InjectEntityManager()
    private readonly manager: EntityManager,
  ) {
    this.paymRepo = this.manager.getRepository(TypeOrmPayment);
  }

  async save(payment: Payment): Promise<void> {
    const typeOrmPayment = this.toTypeOrmEntity(payment);
    await this.paymRepo.save(typeOrmPayment);
  }

  async findById(id: PaymentId): Promise<Payment | null> {
    const dbPayment = await this.paymRepo.findOne({
      where: { id: id.value },
      relations: ['user'],
    });

    if (!dbPayment) {
      return null;
    }

    return this.toDomainEntity(dbPayment);
  }

  async findByUserId(userId: UserId): Promise<Payment[]> {
    const dbPayments = await this.paymRepo.find({
      where: { user: { id: userId.value } },
      order: { createdAt: 'DESC' },
    });

    return dbPayments.map((p) => this.toDomainEntity(p));
  }

  private toTypeOrmEntity(payment: Payment): TypeOrmPayment {
    const typeOrmPayment = new TypeOrmPayment();

    typeOrmPayment.id = payment.id.value;
    typeOrmPayment.user = new TypeOrmUser();
    typeOrmPayment.user.id = payment.userId.value;

    typeOrmPayment.chargeAmount = payment.chargeAmount.cents;
    typeOrmPayment.paymentAmount = payment.paymentAmount?.cents || 0;

    typeOrmPayment.status = payment.status || PaymentStatusEnum.pending;
    return typeOrmPayment;
  }

  private toDomainEntity(typeOrmPayment: TypeOrmPayment): Payment {
    const params: IPaymentParams = {
      id: PaymentId.fromString(typeOrmPayment.id),
      userId: UserId.fromString(typeOrmPayment.user.id),
      chargeAmount: new Money(typeOrmPayment.chargeAmount),
      paymentAmount: typeOrmPayment.paymentAmount
        ? new Money(typeOrmPayment.paymentAmount)
        : undefined,
      status: typeOrmPayment.status,
    };

    return new PaymentBuilder()
      .withParams(params)
      .withPolicies(this.getRetreivalCalculationPolicy())
      .withSpecs(this.getRetreivalSpecs())
      .build();
  }

  private getRetreivalCalculationPolicy(): ICalculationPolicy {
    return new DefaultCalculationPolicy();
  }

  private getRetreivalSpecs(): ISpecification<Payment>[] {
    return [new AmountSpecification(), new StatusSpecification()];
  }
}
