import { Inject, Injectable, OnApplicationShutdown } from '@nestjs/common';
import { IMessageServiceStepsToConsume } from '../messaging.interfaces';
import { KafkaProducer } from './kafka.producer';
import { Consumer, ConsumerSubscribeTopics } from 'kafkajs';
import { KAFKA_CONSUMER, KAFKA_TOPICS_TO_CONSUME } from './kafka.config';

@Injectable()
export class KafkaConsumer implements OnApplicationShutdown {
  public static getTopicsToConsume(
    steps: IMessageServiceStepsToConsume,
  ): string[] {
    return steps.map((step) => KafkaProducer.getTopicFromStep(step));
  }

  constructor(
    @Inject(KAFKA_CONSUMER)
    private readonly consumer: Consumer,
    @Inject(KAFKA_TOPICS_TO_CONSUME)
    private readonly topicsToConsume: ConsumerSubscribeTopics,
  ) {}

  public async onApplicationShutdown() {
    await this.consumer.disconnect();
  }
}
