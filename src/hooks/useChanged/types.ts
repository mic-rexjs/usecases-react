export interface CompareCallback<T> {
  (newValue: T, oldValue?: T): boolean;
}
