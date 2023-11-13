export interface EntityChangeEventHandler<T> {
  (newEntity: T, prevEntity: T): void;
}
