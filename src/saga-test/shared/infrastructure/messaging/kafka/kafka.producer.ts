import {
  OnModuleInit,
  OnApplicationShutdown,
  Inject,
  Logger,
} from '@nestjs/common';
import { Producer, Message, CompressionTypes } from 'kafkajs';
import { KAFKA_PRODUCER } from './kafka.config';
import {
  ICombinedMessageServiceSteps,
  IMessageServiceStepsToConsume,
  IMessageServiceStepsToProduce,
  MessagingProducer,
} from '../messaging.interfaces';

export class KafkaProducer
  implements OnModuleInit, OnApplicationShutdown, MessagingProducer
{
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
    step: IMessageServiceStepsToProduce[number],
  ): Promise<void> {
    const payload: Message = {
      value: JSON.stringify(message),
      key: step,
    };
    const topic = KafkaProducer.getTopicFromStep(step);

    await this.producer.send({
      topic,
      messages: [payload],
      compression: CompressionTypes.GZIP,
    });
    Logger.log(`topic: ${topic}`, 'PRODUCING');
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

  public static topicSeparator = '__';
  public static getTopicFromStep(
    step: ICombinedMessageServiceSteps[number],
  ): string {
    return step;
  }
  public static getStepFromTopic(
    topic: string,
  ): IMessageServiceStepsToConsume[number] {
    return topic.split(
      this.topicSeparator,
    )[1] as IMessageServiceStepsToConsume[number];
  }
}
