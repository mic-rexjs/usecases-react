import { useDepsKey } from '../useDepsKey';
import { ExecCallback } from './types';
import { RestArguments } from '@mic-rexjs/usecases/es/types';
import { useCreation, useMemoizedFn } from 'ahooks';

export const useExec = <T>(
  callback: ExecCallback<T>,
  // 默认：如果 `callback` 没有用 `useMemorizedFn`，就会每次都执行，否则只执行一次
  deps: RestArguments = [callback],
): T => {
  const depsKey = useDepsKey(deps);

  const execCallback = useMemoizedFn((): T => {
    return callback();
  });

  return useCreation((): T => {
    void depsKey;

    return execCallback();
  }, [depsKey, execCallback]);
};
