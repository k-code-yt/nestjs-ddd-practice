import { DynamicModule, Module, Provider } from '@nestjs/common';
import { MessageModule } from '../../../shared/infrastructure/messaging/messaging.module';
import { DomainNameEnum } from '../../../_lib';
import { InfraModuleBootstrapOptions } from '../../../shared/interfaces/infra-bootsrap-options.interface';
import { OrderDomainMessagingService } from './order-domain-messaging.service';
import { DebeziumMessageModule } from '../../../shared/infrastructure/messaging/debezium/debezium.module';
import { OrderDBStreamMessagingService } from './cdc-order-db-stream-messaging.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  MessagingConsumer,
  MessagingProducer,
} from '../../../shared/infrastructure/messaging/messaging.interfaces';
import { TypeOrmSagaRepository } from '../../../shared/infrastructure/database/typeorm/repositories/typeorm-saga.repository';
import { TypeOrmOutboxEventRepository } from '../../../shared/infrastructure/database/typeorm/repositories/typeorm-outbox-event.repository';

@Module({})
export class OrderMessageModule {
  static forRoot(options: InfraModuleBootstrapOptions): DynamicModule {
    const domain = DomainNameEnum.Order;
    const modules: DynamicModule[] = [];
    const providers: Provider[] = [];

    const domainModule = MessageModule.forDomain(
      domain,
      options?.messagingDriver,
    );

    modules.push(domainModule);
    const domainConsumerToken =
      MessageModule.getConsumerInjectionToken(domain).value;

    providers.push({
      provide: OrderDomainMessagingService,
      useFactory: (
        consumer: MessagingConsumer,
        eventEmitter: EventEmitter2,
      ) => {
        return new OrderDomainMessagingService(consumer, eventEmitter);
      },
      inject: [domainConsumerToken, EventEmitter2],
    });

    if (options?.shouldEnableDBStreaming) {
      const debeziumModule = DebeziumMessageModule.forDomain(
        domain,
        options?.messagingDriver,
      );
      modules.push(debeziumModule);

      const dbStreamConsumerToken =
        DebeziumMessageModule.getConsumerInjectionToken(domain).value;
      providers.push({
        provide: OrderDBStreamMessagingService,
        useFactory: (
          consumer: MessagingConsumer,
          producer: MessagingProducer,
          eventEmitter: EventEmitter2,
          sagaRepo: TypeOrmSagaRepository,
          outboxRepo: TypeOrmOutboxEventRepository,
        ) => {
          return new OrderDBStreamMessagingService(
            consumer,
            producer,
            eventEmitter,
            sagaRepo,
            outboxRepo,
          );
        },
        inject: [
          dbStreamConsumerToken,
          MessagingProducer,
          EventEmitter2,
          //TODO -> add abstraction
          TypeOrmSagaRepository,
          TypeOrmOutboxEventRepository,
        ],
      });
    }

    return {
      module: OrderMessageModule,
      imports: modules,
      exports: modules,
      providers,
    };
  }
}
