export interface ISpecification<T> {
  isSatisfiedBy(candidate: T): boolean;
  reason(candidate: T): string;
}
