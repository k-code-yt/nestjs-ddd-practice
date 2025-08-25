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
    const domainEventsToConsume = Messaging.Config.getEventsToConsume(domain);
    const injectionToken = this.getConsumerInjectionToken(domain).value;
    const domainOptions: IDomainMessagingOptions = {
      domain,
      consumerGroupPrefix: domain,
      injectionToken,
      eventsToConsume: domainEventsToConsume,
    };

    const modules =
      driver === Messaging.MessageDriverTypeEnum.kafka
        ? [KafkaDomainModule.forDomain(domainOptions)]
        : [];

    return {
      module: MessageModule,
      imports: modules,
      exports: modules,
    };
  }

  static getConsumerInjectionToken(domain: DomainNameEnum) {
    const domainEventsToConsume =
      Messaging.Config.getEventsToConsume(domain).join('');

    return { key: domain, value: `${domain}_${domainEventsToConsume}` };
  }
}
