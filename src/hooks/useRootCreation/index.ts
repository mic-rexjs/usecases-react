import { useDepsKey } from '../useDepsKey';
import { RootCreationCallback } from './types';
import { useCreation, useMemoizedFn } from 'ahooks';
import { Statuses } from '@/enums/Statuses';
import { Dependencies } from '@/types';

export const useRootCreation = <T>(
  statuses: Statuses,
  callback: RootCreationCallback<T>,
  shouldCheckEntity = false,
  deps: Dependencies = [],
): T | null => {
  const depsKey = useDepsKey(deps);
  const targetStatuses = shouldCheckEntity ? Statuses.EntityRootEnabled : Statuses.RootEnabled;
  const rootEnabled = (statuses & targetStatuses) === targetStatuses;

  const onInit = useMemoizedFn((): T => {
    return callback();
  });

  return useCreation((): T | null => {
    void depsKey;

    if (!rootEnabled) {
      return null;
    }

    return onInit();
  }, [rootEnabled, depsKey, onInit]);
};
