import { DynamicModule, Module } from '@nestjs/common';
import { MessageModule } from '../../shared/infrastructure/messaging/messaging.module';
import { DomainNameEnum } from '../../_lib';
import { InfraModuleBootstrapOptions } from '../../shared/interfaces/infra-bootsrap-options.interface';

@Module({})
export class PaymentMessageModule {
  static forRoot(options: InfraModuleBootstrapOptions): DynamicModule {
    const module = MessageModule.forDomain(
      DomainNameEnum.Payment,
      options?.messagingDriver,
    );

    return {
      module: PaymentMessageModule,
      imports: [module],
      exports: [module],
    };
  }
}
