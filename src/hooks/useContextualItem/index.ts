import { useReducers } from '../useReducers';
import { CreateContextualItemFactory } from './types';
import { useCreation, useLatest, useMemoizedFn } from 'ahooks';
import { Statuses } from '@/enums/Statuses';
import { methodUseCase } from '@/usecases/methodUseCase';

export const useContextualItem = <T>(
  contextItem: T | null,
  statuses: Statuses,
  createFactory: CreateContextualItemFactory<T>,
  depsKey = 0,
): T => {
  const factoryRef = useLatest(createFactory);
  const { cacheCall } = useReducers(methodUseCase);

  const onCache = useMemoizedFn((): CreateContextualItemFactory<T> => {
    const { current: currentFactory } = factoryRef;

    void depsKey;

    // 防止在以下 `onCreate()` 多次调用实际 `factory`
    return cacheCall(currentFactory, {
      onCompare(): boolean {
        return true;
      },
    });
  });

  const onCreate = useCreation((): CreateContextualItemFactory<T> => {
    void depsKey;

    return onCache();
  }, [depsKey, onCache]);

  return useCreation((): T => {
    const rootEnabled = (statuses & Statuses.RootEnabled) === Statuses.RootEnabled;

    if (!rootEnabled && contextItem) {
      return contextItem as T;
    }

    return onCreate();
  }, [statuses, contextItem, onCreate]);
};
