import { DynamicModule, Module, Provider } from '@nestjs/common';
import {
  Consumer,
  ConsumerSubscribeTopics,
  ConsumerConfig,
  Kafka,
} from 'kafkajs';
import { Messaging } from '../messaging.config';
import {
  IDomainMessagingOptions,
  MessagingProducer,
  MessagingConsumer,
} from '../messaging.interfaces';
import { KafkaCoreModule } from './kafka-core.module';
import {
  getKafkaConsumerToken,
  KAFKA_INSTANCE,
  KAFKA_ADMIN,
  KAFKA_DOMAIN_MESSAGING_OPTIONS,
} from './kafka.config';
import { KafkaConsumer } from './kafka.consumer';
import { KafkaProducer } from './kafka.producer';

@Module({})
export class KafkaDomainModule {
  static forDomain(options: IDomainMessagingOptions): DynamicModule {
    const consumerToken = getKafkaConsumerToken(options.domain);
    const consumerGroupId = `${options.consumerGroupPrefix}-consumer-group`;

    const domainProviders: Provider[] = [
      {
        provide: KAFKA_DOMAIN_MESSAGING_OPTIONS,
        useValue: options,
      },
      {
        provide: consumerToken,
        useFactory: async (kafka: Kafka): Promise<Consumer> => {
          const topics = options.eventsToConsume.map((event) =>
            Messaging.Config.getTopicName(event),
          );

          const consumerTopics: ConsumerSubscribeTopics = {
            topics,
            fromBeginning: false,
          };

          const config: ConsumerConfig = {
            groupId: consumerGroupId,
            heartbeatInterval: 3000,
          };

          const consumer = kafka.consumer(config);
          await consumer.connect();
          await consumer.subscribe(consumerTopics);

          return consumer;
        },
        inject: [KAFKA_INSTANCE, KAFKA_ADMIN],
      },
      {
        provide: KafkaConsumer,
        useFactory: (consumer, domainOptions) => {
          return new KafkaConsumer(consumer, domainOptions);
        },
        inject: [KafkaProducer, consumerToken, KAFKA_DOMAIN_MESSAGING_OPTIONS],
      },
      {
        provide: MessagingConsumer,
        useFactory: (c: MessagingConsumer) => c,
        inject: [KafkaConsumer],
      },
    ];

    return {
      module: KafkaDomainModule,
      imports: [KafkaCoreModule],
      providers: domainProviders,
      exports: [MessagingConsumer],
    };
  }
}
