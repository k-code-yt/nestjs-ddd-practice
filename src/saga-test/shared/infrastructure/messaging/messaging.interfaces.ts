import { DomainNameEnum } from '../../../_lib';
import { Messaging } from './messaging.config';

export interface IDomainMessagingOptions {
  domain: DomainNameEnum;
  consumerGroupPrefix: string;
  eventsToConsume: Messaging.AllDomainEvents[];
}

export interface MessageMetadata {
  topic: string;
  partition: number;
  offset: string;
  timestamp: string;
  key?: string;
  headers?: Record<string, string>;
}
export abstract class MessagingProducer {
  abstract produce(
    message: any,
    step: Messaging.AllDomainEvents,
  ): Promise<void>;
}

export abstract class MessagingConsumer {
  abstract consume(
    event: Messaging.AllDomainEvents,
    handler: (msg: any, metadata: any) => Promise<void>,
  ): Promise<void>;

  abstract start(): Promise<void>;
  abstract stop(): Promise<void>;
}
