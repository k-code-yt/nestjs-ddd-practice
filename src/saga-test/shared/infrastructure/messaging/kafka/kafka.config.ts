export namespace Kafka {}

export const KAFKA_INSTANCE = Symbol('KAFKA_INSTANCE');
export const KAFKA_CONSUMER = Symbol('KAFKA_CONSUMER');
export const KAFKA_PRODUCER = Symbol('KAFKA_PRODUCER');
export const KAFKA_TOPICS_TO_CONSUME = Symbol('KAFKA_TOPICS_TO_CONSUME');
export const KAFKA_ADMIN = Symbol('KAFKA_ADMIN');
export const KAFKA_CONSUMER_GROUP_ID = Symbol('DEFAULT_CG');
export const KAFKA_DOMAIN_MESSAGING_OPTIONS = Symbol(
  'KAFKA_DOMAIN_MESSAGING_OPTIONS',
);

// --- CONSUMERS
export const KAFKA_CONSUMER_ORDER = Symbol('KAFKA_CONSUMER_ORDER');
export const KAFKA_CONSUMER_PAYMENT = Symbol('KAFKA_CONSUMER_PAYMENT');
export const KAFKA_CONSUMER_USER = Symbol('KAFKA_CONSUMER_USER');
export const KAFKA_CONSUMER_SAGA = Symbol('KAFKA_CONSUMER_SAGA');

export function getKafkaConsumerToken(domain: string): symbol {
  const tokens: Record<string, symbol> = {
    order: KAFKA_CONSUMER_ORDER,
    payment: KAFKA_CONSUMER_PAYMENT,
    user: KAFKA_CONSUMER_USER,
    saga: KAFKA_CONSUMER_SAGA,
  };

  return tokens[domain] || Symbol(`KAFKA_CONSUMER_${domain.toUpperCase()}`);
}
