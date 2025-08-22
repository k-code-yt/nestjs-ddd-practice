import { DynamicModule, Module } from '@nestjs/common';
import { MessageModule } from '../../../shared/infrastructure/messaging/messaging.module';
import { DomainNameEnum } from '../../../_lib';
import { InfraModuleBootstrapOptions } from '../../../shared/interfaces/infra-bootsrap-options.interface';
import { OrderMessagingService } from './order-messaging.service';
import { OrderEventHandler } from './order-event.handler';

@Module({})
export class OrderMessageModule {
  static forRoot(options: InfraModuleBootstrapOptions): DynamicModule {
    const module = MessageModule.forDomain(
      DomainNameEnum.Order,
      options?.messagingDriver,
    );

    return {
      module: OrderMessageModule,
      imports: [module],
      exports: [module],
      providers: [OrderMessagingService, OrderEventHandler],
    };
  }
}
