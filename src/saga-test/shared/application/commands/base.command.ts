import { v4 as uuid } from 'uuid';

export abstract class BaseCommand {
  public readonly commandId: string;
  public readonly correlationId: string;
  public readonly timestamp: Date;

  constructor(correlationId?: string) {
    this.commandId = `cmd-${uuid()}`;
    this.correlationId = correlationId || this.commandId;
    this.timestamp = new Date();
  }
}
