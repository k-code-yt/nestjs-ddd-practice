import { DynamicModule, Module } from '@nestjs/common';
import { Messaging } from './messaging.config';
import { IDomainMessagingOptions } from './messaging.interfaces';
import { KafkaDomainModule } from './kafka/kafka-domain.module';
import { DomainNameEnum } from '../../../_lib';

@Module({})
export class MessageModule {
  static forDomain(
    domain: DomainNameEnum,
    driver: Messaging.MessageDriverTypeEnum,
  ): DynamicModule {
    const eventsToConsume = Messaging.Config.getEventsToConsume(domain);

    const options: IDomainMessagingOptions = {
      domain,
      consumerGroupPrefix: domain,
      eventsToConsume,
    };

    const modules =
      driver === Messaging.MessageDriverTypeEnum.kafka
        ? [KafkaDomainModule.forDomain(options)]
        : [];

    return {
      module: MessageModule,
      imports: modules,
      exports: modules,
    };
  }
}
