import { useContextualItem } from '../useContextualItem';
import { useEntityInitializing } from '../useEntityInitializing';
import { useExec } from '../useExec';
import { EntityReducers, EntityStore } from '@mic-rexjs/usecases';
import { usePrevious } from 'ahooks';
import { useContext, useRef, useState } from 'react';
import { Statuses } from '@/enums/Statuses';
import { runEntityInitializer } from '@/methods/runEntityInitializer';
import { Dependencies, EntityInitializer } from '@/types';
import { EntityUseCaseContextValue, UseCaseContext } from '@/usecases/contextUseCase/types';

export const useStore = <T>(
  entityArg: T | EntityInitializer<T>,
  context: UseCaseContext<EntityUseCaseContextValue<T, EntityReducers<T>>>,
  statuses: Statuses,
  deps: Dependencies = [],
): EntityStore<T> => {
  const isFunction = typeof entityArg === 'function';
  const isInitializing = useEntityInitializing(statuses);
  const createEntityListRef = useRef<Partial<T>[]>([]);
  const contextValue = useContext(context);
  const { store: contextStore = null } = contextValue || {};
  const entityRootEnabled = (statuses & Statuses.EntityRootEnabled) === Statuses.EntityRootEnabled;

  const [store] = useState((): EntityStore<T> => {
    return new EntityStore(void 0 as T);
  });

  const prevEntityArg = usePrevious(entityArg, (): boolean => {
    return true;
  });

  /**
   * 这里只有初始化和 `deps` 变化时，才会执行；
   * 比如：`useUseCase(entityInitailizer, usecase, options, [key])`，
   * 当首次调用 `entityInitailizer` 或 `key` 变化，才会触发以下事件
   */
  const onRunInitializer = (): void => {
    const { current: createEntityList } = createEntityListRef;

    createEntityListRef.current = runEntityInitializer(
      store,
      entityArg as EntityInitializer<T>,
      createEntityList,
      isInitializing,
    );
  };

  /**
   * 这里仅仅是将非函数的 `entity` 同步；
   *
   * 比如 `useUseCase(entity, usecase)`，
   * 当传入的 `entity` 变化时，执行一下同步操作。
   */
  useExec((): void => {
    switch (true) {
      case !entityRootEnabled:
      case isFunction:
        return;

      case isInitializing:
        store.initValue(entityArg as T);
        return;

      case entityArg === prevEntityArg:
        return;
    }

    // 执行同步操作
    store.setValue(entityArg as T);
  });

  return useContextualItem(
    contextStore,
    statuses,
    (): EntityStore<T> => {
      if (entityRootEnabled && isFunction) {
        onRunInitializer();
      }

      return store;
    },
    deps,
  );
};
