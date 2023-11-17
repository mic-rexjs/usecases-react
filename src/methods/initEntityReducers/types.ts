export interface EntityChangeEventHandler<T> {
  (newEntity: T, oldEntity: T): void;
}
