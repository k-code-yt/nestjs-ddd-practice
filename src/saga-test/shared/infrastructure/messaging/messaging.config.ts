export namespace Messaging {
  export type AllDomainEvents =
    | OrderEventsEnum
    | PaymentEventsEnum
    | UserEventsEnum
    | SagaEventsEnum;

  export interface DomainTopicConfig {
    events: AllDomainEvents[];
    topicPrefix: string;
  }

  export enum MessageDriverTypeEnum {
    kafka = 'kafka',
  }

  // Order Domain Events
  export enum OrderEventsEnum {
    OrderCreated = 'order.created',
    OrderConfirmed = 'order.confirmed',
    OrderCancelled = 'order.cancelled',
    OrderCompleted = 'order.completed',
    OrderFailed = 'order.failed',
  }

  // Payment Domain Events
  export enum PaymentEventsEnum {
    PaymentRequested = 'payment.requested',
    PaymentProcessed = 'payment.processed',
    PaymentFailed = 'payment.failed',
    PaymentRefunded = 'payment.refunded',
  }

  // User Domain Events
  export enum UserEventsEnum {
    UserUpdated = 'user.updated',
    UserNotified = 'user.notified',
  }

  export enum SagaEventsEnum {
    OrderPaymentSagaStarted = 'saga.order-payment.started',
    OrderPaymentSagaCompleted = 'saga.order-payment.completed',
    OrderPaymentSagaFailed = 'saga.order-payment.failed',
    OrderPaymentSagaCompensated = 'saga.order-payment.compensated',
  }

  export class Config {
    public static get allEvents(): AllDomainEvents[] {
      return [
        ...Object.values(OrderEventsEnum),
        ...Object.values(PaymentEventsEnum),
        ...Object.values(UserEventsEnum),
        ...Object.values(SagaEventsEnum),
      ];
    }

    // Domain-specific event mappings for consumers
    public static getEventsForDomain(domain: string): AllDomainEvents[] {
      const domainEventMap: Record<string, AllDomainEvents[]> = {
        order: [
          // Order domain produces these
          ...Object.values(OrderEventsEnum),
          // Order domain consumes payment events for saga coordination
          PaymentEventsEnum.PaymentProcessed,
          PaymentEventsEnum.PaymentFailed,
          // Order domain consumes saga events
          SagaEventsEnum.OrderPaymentSagaStarted,
          SagaEventsEnum.OrderPaymentSagaCompleted,
          SagaEventsEnum.OrderPaymentSagaFailed,
        ],
        payment: [
          // Payment domain produces these
          ...Object.values(PaymentEventsEnum),
          // Payment domain consumes order events for processing
          OrderEventsEnum.OrderCreated,
          OrderEventsEnum.OrderCancelled,
          // Payment domain consumes saga events
          SagaEventsEnum.OrderPaymentSagaStarted,
        ],
        user: [
          // User domain produces these
          ...Object.values(UserEventsEnum),
          // User domain consumes order/payment events for notifications
          OrderEventsEnum.OrderCompleted,
          OrderEventsEnum.OrderFailed,
          PaymentEventsEnum.PaymentProcessed,
          PaymentEventsEnum.PaymentFailed,
        ],
        saga: [
          // Saga orchestrator consumes all relevant events
          ...Object.values(OrderEventsEnum),
          ...Object.values(PaymentEventsEnum),
          // Saga orchestrator produces saga events
          ...Object.values(SagaEventsEnum),
        ],
      };

      return domainEventMap[domain] || [];
    }

    public static getTopicName(event: AllDomainEvents): string {
      return `${process.env.SERVICE_NAME || 'monolith'}.${event}`;
    }
  }
}
