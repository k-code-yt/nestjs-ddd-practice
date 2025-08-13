import { ICalculationPolicy } from '../entities/payment';
import { Money } from '../../../shared/domain/value-objects/money.vo';

export class DefaultCalculationPolicy implements ICalculationPolicy {
  public calculatePayment(amount: Money): Money {
    return amount;
  }
}

export class PremiumCalculationPolicy implements ICalculationPolicy {
  private readonly premiumRate = 1.2;

  public calculatePayment(amount: Money): Money {
    return amount.multiply(this.premiumRate);
  }
}
