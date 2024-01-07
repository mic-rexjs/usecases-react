import { useCreation, useLatest } from 'ahooks';
import { useCompareDeps } from '../useCompareDeps';
import { cacheCall } from '@/methods/cacheCall';
import { CacheableFactory } from '@/methods/cacheCall/types';

export const useMemoizedCall = <T extends CacheableFactory>(factory: T, deps: unknown[]): T => {
  const depsKey = useCompareDeps(deps);
  const factoryRef = useLatest(factory);

  return useCreation((): T => {
    void depsKey;

    return cacheCall(factoryRef.current, {
      onCompare(): boolean {
        return true;
      },
    });
  }, [depsKey, factoryRef]);
};
