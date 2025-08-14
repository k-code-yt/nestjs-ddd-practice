import { DynamicModule, Global, Module } from '@nestjs/common';
import { KafkaMessageModule } from './kafka/kafka.module';
import { IMessageServiceBootstrapOptions } from './messaging.interfaces';
import { Messaging } from './messaging.config';

@Global()
@Module({})
export class MessageModule {
  static forRoot(options: IMessageServiceBootstrapOptions): DynamicModule {
    const module =
      options.driver == Messaging.MessageDriverTypeEnum.kafka
        ? [KafkaMessageModule.forRoot(options)]
        : [];

    return {
      module: MessageModule,
      imports: module,
      exports: module,
    };
  }
}
