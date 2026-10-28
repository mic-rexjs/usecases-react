import { Dependencies } from '@/types';

export interface ReturnCallback<T> {
  (): T;
}

export interface ReturnDestructor {
  (isUnmount: boolean): void;
}

export interface ReturnHook {
  <T>(
    callback: ReturnCallback<T>,
    // 默认：如果 `callback` 没有用 `useMemorizedFn`，就会每次都执行，否则只执行一次
    deps?: Dependencies,
  ): T;

  <T>(
    callback: ReturnCallback<T>,
    destructor: ReturnDestructor | null,
    // 默认：如果 `callback` 没有用 `useMemorizedFn`，就会每次都执行，否则只执行一次
    deps?: Dependencies,
  ): T;
}
