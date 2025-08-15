import { Messaging } from '../infrastructure/messaging/messaging.config';

export interface InfraModuleBootstrapOptions {
  messagingDriver: Messaging.MessageDriverTypeEnum;
}
