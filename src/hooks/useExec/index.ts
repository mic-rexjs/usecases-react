import { useDepsKey } from '../useDepsKey';
import { RestArguments } from '@mic-rexjs/usecases/es/types';
import { useCreation, useMemoizedFn } from 'ahooks';

export const useExec = (
  callback: VoidFunction,
  // 默认：如果 `callback` 没有用 `useMemorizedFn`，就会每次都执行，否则只执行一次
  deps: RestArguments = [callback],
): void => {
  const depsKey = useDepsKey(deps);

  const execCallback = useMemoizedFn((): void => {
    callback();
  });

  useCreation((): void => {
    void depsKey;

    execCallback();
  }, [depsKey, execCallback]);
};
