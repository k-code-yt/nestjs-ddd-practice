import { DynamicModule, Global, Module } from '@nestjs/common';
import { KafkaCoreModule } from './messaging/kafka/kafka-core.module';
import { Messaging } from './messaging/messaging.config';
import { InfraModuleBootstrapOptions } from '../interfaces/infra-bootsrap-options.interface';
import { DBModule } from './database/typeorm/database.module';

@Global()
@Module({})
export class InfraModule {
  static forRoot(options: InfraModuleBootstrapOptions): DynamicModule {
    const dynamicModules =
      options.messagingDriver == Messaging.MessageDriverTypeEnum.kafka
        ? [KafkaCoreModule.forRoot()]
        : [];

    const modules = [...dynamicModules, DBModule];

    return {
      module: InfraModule,
      imports: modules,
      exports: modules,
      providers: [],
    };
  }
}
