import { DynamicModule, Module, Provider } from '@nestjs/common';
import { MessageModule } from '../../../shared/infrastructure/messaging/messaging.module';
import { DomainNameEnum } from '../../../_lib';
import { InfraModuleBootstrapOptions } from '../../../shared/interfaces/infra-bootsrap-options.interface';
import { PaymentMessagingService } from './payment-messaging.service';
import { PaymentEventHandler } from './outbox-payment-event.handler';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  MessagingConsumer,
  MessagingProducer,
} from '../../../shared/infrastructure/messaging/messaging.interfaces';
import { TypeOrmOutboxEventRepository } from '../../../shared/infrastructure/database/typeorm/repositories/typeorm-outbox-event.repository';
import { DebeziumMessageModule } from '../../../shared/infrastructure/messaging/debezium/debezium.module';
import { TypeOrmSagaRepository } from '../../../shared/infrastructure/database/typeorm/repositories/typeorm-saga.repository';
import { PaymentDBStreamMessagingService } from './cdc-payment-db-stream-messaging.service';

@Module({})
export class PaymentMessageModule {
  static forRoot(options: InfraModuleBootstrapOptions): DynamicModule {
    const domain = DomainNameEnum.Payment;
    const modules: DynamicModule[] = [];
    const providers: Provider[] = [PaymentEventHandler];

    modules.push(
      MessageModule.forDomain(DomainNameEnum.Payment, options?.messagingDriver),
    );
    const domainConsumerToken =
      MessageModule.getConsumerInjectionToken(domain).value;

    providers.push({
      provide: PaymentMessagingService,
      useFactory: (
        consumer: MessagingConsumer,
        eventEmitter: EventEmitter2,
        // TODO -> rename to eventsRepo
        outboxRepo: TypeOrmOutboxEventRepository,
      ) => {
        return new PaymentMessagingService(consumer, eventEmitter, outboxRepo);
      },

      inject: [
        domainConsumerToken,
        EventEmitter2,
        // TODO -> add abstraction
        TypeOrmOutboxEventRepository,
      ],
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
        provide: PaymentDBStreamMessagingService,
        useFactory: (
          consumer: MessagingConsumer,
          producer: MessagingProducer,
          eventEmitter: EventEmitter2,
          sagaRepo: TypeOrmSagaRepository,
          outboxRepo: TypeOrmOutboxEventRepository,
        ) => {
          return new PaymentDBStreamMessagingService(
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
      module: PaymentMessageModule,
      imports: modules,
      exports: modules,
      providers,
    };
  }
}
