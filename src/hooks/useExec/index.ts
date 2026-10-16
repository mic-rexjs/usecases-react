import { useDepsKey } from '../useDepsKey';
import { ExecCallback, ExecDestructor } from './types';
import { RestArguments } from '@mic-rexjs/usecases/es/types';
import { useCreation, useMemoizedFn, useUnmount } from 'ahooks';
import { useRef } from 'react';

export const useExec = <T>(
  callback: ExecCallback<T>,
  destructor?: ExecDestructor | null,
  // 默认：如果 `callback` 没有用 `useMemorizedFn`，就会每次都执行，否则只执行一次
  deps: RestArguments = [callback],
): T => {
  const depsKey = useDepsKey(deps);
  const destructorRef = useRef<ExecDestructor | null>(null);

  const onDestruct = (isUnmount = false): void => {
    destructorRef.current?.(isUnmount);
  };

  const onExec = useMemoizedFn((): T => {
    onDestruct();

    // `destructor` 一定是在执行回调的时候，同步绑定的，保持两个回调内的闭包变量一致
    destructorRef.current = destructor || null;
    return callback();
  });

  useUnmount((): void => {
    onDestruct(true);
  });

  return useCreation((): T => {
    void depsKey;

    return onExec();
  }, [depsKey, onExec]);
};
