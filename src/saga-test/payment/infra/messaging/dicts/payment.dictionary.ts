export namespace PaymentDictionary {
  export interface ChangeEvent {
    before?: any;
    after?: any;
    op: 'c' | 'u' | 'd' | 'r'; // create, update, delete, read
    ts_ms: number;
    source: {
      table: string;
      db: string;
    };
  }

  export class CreateEvent {
    id: string;
    description: string;
    amount: string;
    userId: string;

    static create(msg: any): CreateEvent {
      const createEvent = new CreateEvent();
      createEvent.id = msg.id;
      createEvent.description = msg.description;
      createEvent.amount = msg.amount;
      createEvent.userId = msg.userId;
      //   createEvent.status = msg.status;
      return createEvent;
    }
  }
}
