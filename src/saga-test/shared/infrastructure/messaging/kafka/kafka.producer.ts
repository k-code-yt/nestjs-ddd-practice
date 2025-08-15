import {
  OnModuleInit,
  OnApplicationShutdown,
  Inject,
  Logger,
  Injectable,
} from '@nestjs/common';
import { Producer, Message, CompressionTypes } from 'kafkajs';
import { KAFKA_PRODUCER } from './kafka.config';
import { MessagingProducer } from '../messaging.interfaces';
import { Messaging } from '../messaging.config';

@Injectable()
export class KafkaProducer
  implements OnModuleInit, OnApplicationShutdown, MessagingProducer
{
  private readonly logger = new Logger(KafkaProducer.name);

  constructor(
    @Inject(KAFKA_PRODUCER)
    private readonly producer: Producer,
  ) {}

  async onModuleInit() {
    await this.connect();
  }

  public async onApplicationShutdown() {
    await this.producer.disconnect();
  }

  public async produce(
    message: any,
    event: Messaging.AllDomainEvents,
    options?: {
      key?: string;
      partition?: number;
      headers?: Record<string, string>;
    },
  ): Promise<void> {
    const topic = Messaging.Config.getTopicName(event);
    const payload: Message = {
      value: JSON.stringify({
        ...message,
        eventType: event,
        timestamp: new Date().toISOString(),
        messageId: `${event}-${Math.floor(Date.now() / 1000)}-${Math.floor(Math.random() * 1000)}`,
      }),
      key: options?.key || event,
      partition: options?.partition,
      headers: {
        ...options?.headers,
        'event-type': event,
        'content-type': 'application/json',
      },
    };

    try {
      const result = await this.producer.send({
        topic,
        messages: [payload],
        compression: CompressionTypes.GZIP,
      });

      this.logger.log(
        `Event published: ${event} | Topic: ${topic} | Partition: ${result[0].partition} | Offset: ${result[0].baseOffset}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to publish event: ${event} | Topic: ${topic} | Error: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  private async connect() {
    try {
      await this.producer.connect();
    } catch (err) {
      Logger.error(err, 'Failed to connect to Kafka.');
      await new Promise((res) => {
        setTimeout(() => {
          res(true);
        }, 3000);
      });
      await this.connect();
    }
  }
}
