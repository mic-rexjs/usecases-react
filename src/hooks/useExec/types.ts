export interface ExecCallback<T> {
  (): T;
}

export interface ExecDestructor {
  (isUnmount: boolean): void;
}
