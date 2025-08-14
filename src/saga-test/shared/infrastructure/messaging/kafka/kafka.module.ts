import {
  Provider,
  Logger,
  Global,
  DynamicModule,
  Module,
} from '@nestjs/common';
import {
  Kafka,
  ConsumerSubscribeTopics,
  Producer,
  Consumer,
  ConsumerConfig,
  Admin,
} from 'kafkajs';
import {
  IMessageServiceBootstrapOptions,
  MessagingProducer,
} from '../messaging.interfaces';
import {
  KAFKA_INSTANCE,
  KAFKA_TOPICS_TO_CONSUME,
  KAFKA_PRODUCER,
  KAFKA_ADMIN,
  KAFKA_CONSUMER,
  KAFKA_CONSUMER_GROUP_ID,
} from './kafka.config';
import { KafkaConsumer } from './kafka.consumer';
import { KafkaProducer } from './kafka.producer';

function getProviders(options: IMessageServiceBootstrapOptions): Provider[] {
  return [
    {
      provide: KAFKA_INSTANCE,
      useFactory: () => {
        const broker = process.env.KAFKA_BROKER || 'localhost:9092';
        return new Kafka({ brokers: [broker] });
      },
    },
    {
      provide: KAFKA_TOPICS_TO_CONSUME,
      useFactory: (): ConsumerSubscribeTopics => {
        return {
          topics: KafkaConsumer.getTopicsToConsume(options.stepsToConsume),
          fromBeginning: true,
        };
      },
    },
    {
      provide: KAFKA_PRODUCER,
      useFactory: async (kafka: Kafka): Promise<Producer> => {
        return kafka.producer();
      },
      inject: [KAFKA_INSTANCE],
    },
    {
      provide: KAFKA_ADMIN,
      useFactory: async (kafka: Kafka): Promise<Admin> => {
        const kafkaAdmin = kafka.admin();
        const numPartitions = 1;
        for (const step of options.combinedSteps) {
          const topic = KafkaProducer.getTopicFromStep(step);
          const createResult = await kafkaAdmin.createTopics({
            topics: [{ topic, numPartitions }],
          });
          Logger.log(
            `${createResult ? 'topic already exists' : 'new topic created'}`,
            `Topic_Name: ${topic}`,
          );
        }
        return kafkaAdmin;
      },
      inject: [KAFKA_INSTANCE],
    },
    {
      provide: KAFKA_CONSUMER,
      useFactory: async (
        kafka: Kafka,
        consumerTopics: ConsumerSubscribeTopics,
      ): Promise<Consumer> => {
        const config: ConsumerConfig = {
          groupId: KAFKA_CONSUMER_GROUP_ID.toString(),
        };
        const consumer = kafka.consumer(config);
        await consumer.connect();
        await consumer.subscribe(consumerTopics);
        return consumer;
      },
      inject: [KAFKA_INSTANCE, KAFKA_TOPICS_TO_CONSUME, KAFKA_ADMIN],
    },
    {
      provide: MessagingProducer,
      useClass: KafkaProducer,
    },
  ];
}

@Global()
@Module({})
export class KafkaMessageModule {
  static forRoot(options: IMessageServiceBootstrapOptions): DynamicModule {
    return {
      providers: getProviders(options),
      exports: [MessagingProducer],
      module: KafkaMessageModule,
    };
  }
}
