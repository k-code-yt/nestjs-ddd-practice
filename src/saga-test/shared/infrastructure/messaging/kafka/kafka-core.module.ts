import {
  Provider,
  Logger,
  Global,
  DynamicModule,
  Module,
} from '@nestjs/common';
import { Kafka, Producer, Admin } from 'kafkajs';
import { MessagingProducer } from '../messaging.interfaces';
import { KAFKA_INSTANCE, KAFKA_PRODUCER, KAFKA_ADMIN } from './kafka.config';
import { KafkaProducer } from './kafka.producer';
import { Messaging } from '../messaging.config';

function getProviders(): Provider[] {
  return [
    {
      provide: KAFKA_INSTANCE,
      useFactory: () => {
        const broker = process.env.KAFKA_BROKER || 'localhost:9092';
        return new Kafka({ brokers: [broker] });
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
        const allTopics = Messaging.Config.allEvents.map((event) => ({
          topic: Messaging.Config.getTopicName(event),
          numPartitions,
        }));

        try {
          const createResult = await kafkaAdmin.createTopics({
            topics: allTopics,
            waitForLeaders: true,
          });
          Logger.log(`Topic create res: ${createResult}`, 'KAFKA');
        } catch (error) {
          Logger.error(`Err creating topics ${error?.message}`, 'KAFKA');
        }

        return kafkaAdmin;
      },
      inject: [KAFKA_INSTANCE],
    },
    {
      provide: KafkaProducer,
      useFactory: (p) => p,
      inject: [KAFKA_PRODUCER],
    },
    {
      provide: MessagingProducer,
      useClass: KafkaProducer,
    },
  ];
}

@Global()
@Module({})
export class KafkaCoreModule {
  static forRoot(): DynamicModule {
    return {
      providers: getProviders(),
      exports: [
        MessagingProducer,
        KAFKA_ADMIN,
        KAFKA_INSTANCE,
        KAFKA_PRODUCER,
        KafkaProducer,
      ],
      module: KafkaCoreModule,
    };
  }
}
