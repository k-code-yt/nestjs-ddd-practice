import { Messaging } from './messaging.config';

const { CombinedSteps, StepsToConsume, StepsToProduce } =
  Messaging.Config.driverOptions;

export type IMessageServiceStepsToConsume = typeof StepsToConsume;
export type IMessageServiceStepsToProduce = typeof StepsToProduce;
export type ICombinedMessageServiceSteps = typeof CombinedSteps;

export interface IMessageServiceBootstrapOptions {
  stepsToConsume: IMessageServiceStepsToConsume;
  stepsToProduce: IMessageServiceStepsToProduce;
  combinedSteps: ICombinedMessageServiceSteps;
  driver: Messaging.MessageDriverTypeEnum;
}

export abstract class MessagingProducer {
  abstract produce(
    message: any,
    step: IMessageServiceStepsToProduce[number],
  ): Promise<void>;
}
