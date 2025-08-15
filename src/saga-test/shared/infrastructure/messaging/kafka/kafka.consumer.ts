import {
  Injectable,
  OnApplicationShutdown,
  Logger,
  Inject,
} from '@nestjs/common';
import { Consumer, EachMessagePayload } from 'kafkajs';
import { Messaging } from '../messaging.config';
import {
  MessagingConsumer,
  MessageMetadata,
  IDomainMessagingOptions,
} from '../messaging.interfaces';

export class KafkaConsumer implements OnApplicationShutdown, MessagingConsumer {
  private readonly logger = new Logger(KafkaConsumer.name);
  private readonly eventHandlers = new Map<
    Messaging.AllDomainEvents,
    (message: any, metadata: MessageMetadata) => Promise<void>
  >();
  private isRunning = false;
  constructor(
    @Inject()
    private readonly consumer: Consumer,
    private readonly domainOptions: IDomainMessagingOptions,
  ) {}

  async consume(
    event: Messaging.AllDomainEvents,
    handler: (message: any, metadata: MessageMetadata) => Promise<void>,
  ): Promise<void> {
    this.eventHandlers.set(event, handler);
    this.logger.log(
      `Handler registered for event: ${event} in domain: ${this.domainOptions.domain}`,
    );
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      this.logger.warn(
        `Consumer already running for domain: ${this.domainOptions.domain}`,
      );
      return;
    }

    try {
      await this.consumer.run({
        eachMessage: async (payload: EachMessagePayload) => {
          await this.handleMessage(payload);
        },
      });

      this.isRunning = true;
      this.logger.log(
        `Consumer started for domain: ${this.domainOptions.domain}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to start consumer for domain: ${this.domainOptions.domain}`,
        error.stack,
      );
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    try {
      await this.consumer.disconnect();
      this.isRunning = false;
      this.logger.log(
        `Consumer stopped for domain: ${this.domainOptions.domain}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to stop consumer for domain: ${this.domainOptions.domain}`,
        error.stack,
      );
      throw error;
    }
  }

  public async onApplicationShutdown() {
    await this.stop();
  }

  private async handleMessage(payload: EachMessagePayload): Promise<void> {
    const { topic, partition, message } = payload;

    try {
      const eventType = message.headers?.['event-type']?.toString();

      if (!eventType || !message.value) {
        this.logger.warn(
          `Invalid message received on topic: ${topic} | Domain: ${this.domainOptions.domain}`,
        );
        return;
      }

      const handler = this.eventHandlers.get(
        eventType as Messaging.AllDomainEvents,
      );
      if (!handler) {
        this.logger.debug(
          `No handler registered for event: ${eventType} | Domain: ${this.domainOptions.domain}`,
        );
        return;
      }

      const messageData = JSON.parse(message.value.toString());
      const metadata: MessageMetadata = {
        topic,
        partition,
        offset: message.offset,
        timestamp: message.timestamp,
        key: message.key?.toString(),
        headers: Object.fromEntries(
          Object.entries(message.headers || {}).map(([k, v]) => [
            k,
            v?.toString() || '',
          ]),
        ),
      };

      // Execute handler
      await handler(messageData, metadata);

      this.logger.log(
        `Processed event: ${eventType} | Topic: ${topic} | Domain: ${this.domainOptions.domain} | Offset: ${message.offset}`,
      );
    } catch (error) {
      this.logger.error(
        `Error processing message | Topic: ${topic} | Partition: ${partition} | Offset: ${message.offset} | Domain: ${this.domainOptions.domain} | Error: ${error.message}`,
        error.stack,
      );

      // Re-throw to let Kafka handle retry logic
      throw error;
    }
  }

  // Utility method to get registered handlers (useful for debugging)
  getRegisteredHandlers(): string[] {
    return Array.from(this.eventHandlers.keys());
  }
}
