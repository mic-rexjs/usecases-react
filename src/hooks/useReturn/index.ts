import { useDepsKey } from '../useDepsKey';
import { ReturnCallback, ReturnDestructor, ReturnHook } from './types';
import { useCreation as useAhooksCreation, useMemoizedFn, useUnmount } from 'ahooks';
import { useRef } from 'react';
import { Dependencies } from '@/types';

export const useReturn: ReturnHook = <T>(
  callback: ReturnCallback<T>,
  arg2: ReturnDestructor | Dependencies | null = [callback],
  // 默认：如果 `callback` 没有用 `useMemorizedFn`，就会每次都执行，否则只执行一次
  arg3: Dependencies = [callback],
): T => {
  const hasDestructor = !Array.isArray(arg2);
  const [destructor, deps] = hasDestructor ? [arg2, arg3] : [null, arg2];
  const depsKey = useDepsKey(deps);
  const destructorRef = useRef<ReturnDestructor | null>(null);

  const onDestruct = (isUnmount = false): void => {
    destructorRef.current?.(isUnmount);
  };

  const onCreate = useMemoizedFn((): T => {
    onDestruct();

    // `destructor` 一定是在执行回调的时候，同步绑定的，保持两个回调内的闭包变量一致
    destructorRef.current = destructor;
    return callback();
  });

  useUnmount((): void => {
    onDestruct(true);
  });

  return useAhooksCreation((): T => {
    void depsKey;

    return onCreate();
  }, [depsKey, onCreate]);
};
