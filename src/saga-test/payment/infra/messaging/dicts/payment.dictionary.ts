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

  export class ChangePayload {
    paymentId: string;
    chargeAmount: string;
    paymentAmount: string;
    status: string;
    description: string;
    userId: string;
    orderId: string;

    static create(msg: any): ChangePayload {
      const payload = new ChangePayload();
      payload.paymentId = msg.id;
      payload.userId = msg.userId;
      payload.orderId = msg.orderId;
      payload.description = msg.description;
      payload.chargeAmount = msg.chargeAmount;
      payload.paymentAmount = msg.paymentAmount;
      payload.status = msg.status;
      return payload;
    }
  }
}
