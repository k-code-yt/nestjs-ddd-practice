import { Injectable } from '@nestjs/common';
import { Repository, EntityManager } from 'typeorm';
import { IPaymentRepository } from '../../../application/repositories/repos';
import { PaymentTypeOrmEntity } from '../entities/orm-payment.entity';
import { PaymentMapper } from '../mappers/payment.mapper';
import { Payment } from '../../../../saga-test/payment/domain/entities/payment';

@Injectable()
export class TypeOrmPaymentRepository implements IPaymentRepository {
  private paymRepo: Repository<PaymentTypeOrmEntity>;
  constructor(private readonly manager: EntityManager) {
    this.paymRepo = this.manager.getRepository(PaymentTypeOrmEntity);
  }

  async save(payment: Payment): Promise<void> {
    const typeOrmPayment = this.toTypeOrmEntity(payment);
    await this.paymRepo.save(typeOrmPayment);
  }

  async findById(id: string): Promise<Payment | null> {
    const dbPayment = await this.paymRepo.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!dbPayment) {
      return null;
    }

    return this.toDomainEntity(dbPayment);
  }

  private toTypeOrmEntity(payment: Payment): PaymentTypeOrmEntity {
    return PaymentMapper.toTypeOrm(payment);
  }

  private toDomainEntity(typeOrmPayment: PaymentTypeOrmEntity): Payment {
    return PaymentMapper.toDomain(typeOrmPayment);
  }
}
