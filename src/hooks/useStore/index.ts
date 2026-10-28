import { useEntityRootExec } from '../useEntityRootExec';
import { useReturn } from '../useReturn';
import { useRootInitializing } from '../useRootInitializing';
import { EntityStore, utilsUseCase } from '@mic-rexjs/usecases';
import { useContext, useRef } from 'react';
import { Statuses } from '@/enums/Statuses';
import { runEntityInitializer } from '@/methods/runEntityInitializer';
import { EntityInitializer, UnknownReducerMap } from '@/types';
import { EntityUseCaseContextValue, UseCaseContext } from '@/usecases/contextUseCase/types';

export const useStore = <T, TReducers extends UnknownReducerMap<T>>(
  entityArg: T | EntityInitializer<T>,
  context: UseCaseContext<EntityUseCaseContextValue<T, TReducers>>,
  statuses: Statuses,
): EntityStore<T> => {
  const createEntityListRef = useRef<Partial<T>[]>([]);
  const isInitializing = useRootInitializing(statuses);
  const contextValue = useContext(context);
  const { store: contextStore = null } = contextValue || {};
  const initialEntityKey = statuses & Statuses.InitialEntityKey;
  const usecaseKey = statuses & Statuses.UseCaseKey;
  const isRootRuntime = (statuses & Statuses.RootRuntime) === Statuses.RootRuntime;

  const store = useReturn((): EntityStore<T> => {
    const s = new EntityStore(void 0 as T);

    const { createKey } = utilsUseCase();
    (s as unknown as Record<PropertyKey, unknown>).key = createKey();
    return s;
  }, [usecaseKey]);

  const onRunInitializer = (): void => {
    if (!isInitializing) {
      return;
    }

    const { current: createEntityList } = createEntityListRef;

    createEntityListRef.current = runEntityInitializer(
      store,
      entityArg as EntityInitializer<T>,
      createEntityList,
      isInitializing,
    );
  };

  useEntityRootExec(statuses, (): void => {
    const isFunction = typeof entityArg === 'function';

    if (isFunction) {
      onRunInitializer();
      return;
    }

    if (isInitializing) {
      store.initValue(entityArg as T);
      return;
    }

    store.setValue(entityArg as T);
  }, [initialEntityKey]);

  if (isRootRuntime) {
    return store;
  }

  return contextStore!;
};
