import { useReturn } from '../useReturn';
import { ReturnCallback, ReturnDestructor } from '../useReturn/types';
import { IfReturnHook } from './types';
import { Dependencies } from '@/types';

export const useIfReturn: IfReturnHook = <T>(
  value: boolean,
  callback: ReturnCallback<T>,
  arg3?: ReturnDestructor | Dependencies | null,
  // 默认：如果 `callback` 没有用 `useMemorizedFn`，就会每次都执行，否则只执行一次
  arg4?: Dependencies,
): T | null => {
  const isDepsArg3 = Array.isArray(arg3);
  const [destructor, deps] = isDepsArg3 ? [null, arg3] : [arg3, arg4];

  return useReturn(
    (): T | null => {
      if (!value) {
        return null;
      }

      return callback();
    },
    (isUnmount: boolean): void => {
      if (!value) {
        return;
      }

      destructor?.(isUnmount);
    },
    deps,
  );
};
