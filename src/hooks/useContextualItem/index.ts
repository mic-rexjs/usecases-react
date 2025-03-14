import { useCreation, useLatest } from 'ahooks';
import { Statuses } from '@/enums/Statuses';
import { CreateContextualItemFactory } from './types';
import { cacheCall } from '@/methods/cacheCall';

export const useContextualItem = <T>(
  contextItem: T | null,
  statuses: Statuses,
  createFactory: CreateContextualItemFactory<T>,
  depsKey = 0,
): T => {
  const factoryRef = useLatest(createFactory);

  const create = useCreation((): CreateContextualItemFactory<T> => {
    void depsKey;

    return cacheCall(factoryRef.current, {
      onCompare(): boolean {
        return true;
      },
    });
  }, [depsKey, factoryRef]);

  return useCreation((): T => {
    const rootEnabled = (statuses & Statuses.RootEnabled) === Statuses.RootEnabled;

    if (!rootEnabled && contextItem) {
      return contextItem as T;
    }

    return create();
  }, [statuses, contextItem, create]);
};
