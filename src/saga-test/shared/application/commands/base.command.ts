import { v4 as uuid } from 'uuid';

export abstract class BaseCommand {
  public readonly eventId: string;
  public readonly correlationId: string;
  public readonly timestamp: Date;

  constructor(correlationId?: string) {
    this.eventId = `cmd-${uuid()}`;
    this.correlationId = correlationId || this.eventId;
    this.timestamp = new Date();
  }
}
