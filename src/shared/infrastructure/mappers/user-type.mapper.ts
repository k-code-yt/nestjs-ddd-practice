import { UserTypeDto } from '../../../payment/application/dtos/user-type.dto';
import { PaymentUserTypeEnum } from '../../../payment/application/use-cases/create-payment.use-case';
import { UserTypeEnum } from '../../../user/domain/entities/user';

export class UserTypeMapper {
  static toPaymentUserTypeDto(type: UserTypeEnum): UserTypeDto {
    switch (type) {
      case UserTypeEnum.owner:
        return { type: PaymentUserTypeEnum.premium };

      case UserTypeEnum.carrier:
      case UserTypeEnum.driver:
      case UserTypeEnum.driver:
      default:
        return { type: PaymentUserTypeEnum.regular };
    }
  }
}
