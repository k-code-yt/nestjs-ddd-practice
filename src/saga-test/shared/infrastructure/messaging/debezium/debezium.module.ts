import { DynamicModule, Module } from '@nestjs/common';
import { Messaging } from '../messaging.config';
import { IDomainMessagingOptions } from '../messaging.interfaces';
import { KafkaDomainModule } from '../kafka/kafka-domain.module';
import { DomainNameEnum } from '../../../../_lib';

// TODO -> refactor -> move to the same level as Kafka
@Module({})
export class DebeziumMessageModule {
  static forDomain(
    domain: DomainNameEnum,
    driver: Messaging.MessageDriverTypeEnum,
  ): DynamicModule {
    const streamingEventsToConsume = Messaging.Config.getDBStreamEvents(domain);
    const injectionToken = this.getConsumerInjectionToken(domain).value;

    const streamingOptions: IDomainMessagingOptions = {
      domain,
      consumerGroupPrefix: `${domain}_${streamingEventsToConsume[0]}`,
      injectionToken,
      eventsToConsume: streamingEventsToConsume,
      //   fromBeginning: true,
    };

    const modules =
      driver === Messaging.MessageDriverTypeEnum.kafka
        ? [KafkaDomainModule.forDomain(streamingOptions)]
        : [];
    return {
      module: DebeziumMessageModule,
      imports: modules,
      exports: modules,
    };
  }

  static getConsumerInjectionToken(domain: DomainNameEnum) {
    const domainEventsToConsume =
      Messaging.Config.getEventsToConsume(domain).join('');
    const key = `debezium_${domain}`;
    return { key, value: `${key}_${domainEventsToConsume}` };
  }
}
