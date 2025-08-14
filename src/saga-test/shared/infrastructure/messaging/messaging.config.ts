export namespace Messaging {
  export enum UpdateUserStepsEnum {
    Init = 'UpdateUser_init',
    Done = 'UpdateUser_done',
    Error = 'UpdateUser_error',
  }

  export enum MessageDriverTypeEnum {
    kafka = 'kafka',
  }

  export class Config {
    public static get driverOptions() {
      const toProcess = Object.values(UpdateUserStepsEnum);

      return {
        CombinedSteps: toProcess,
        StepsToConsume: toProcess,
        StepsToProduce: toProcess,
      };
    }
  }
}
