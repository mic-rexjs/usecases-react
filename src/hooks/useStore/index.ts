import { useContextualItem } from '../useContextualItem';
import { useEntityInitializing } from '../useEntityInitializing';
import { EntityReducers, EntityStore } from '@mic-rexjs/usecases';
import { useContext, useRef, useState } from 'react';
import { Statuses } from '@/enums/Statuses';
import { initStore } from '@/methods/initStore';
import { Dependencies, EntityInitializer } from '@/types';
import { EntityUseCaseContextValue, UseCaseContext } from '@/usecases/contextUseCase/types';

export const useStore = <T>(
  entityArg: T | EntityInitializer<T>,
  context: UseCaseContext<EntityUseCaseContextValue<T, EntityReducers<T>>>,
  statuses: Statuses,
  deps: Dependencies = [],
): EntityStore<T> => {
  const isInitializing = useEntityInitializing(statuses);
  const createEntityListRef = useRef<Partial<T>[]>([]);
  const contextValue = useContext(context);
  const { store: contextStore = null } = contextValue || {};

  const [store] = useState((): EntityStore<T> => {
    return new EntityStore(void 0 as T);
  });

  return useContextualItem(
    contextStore,
    statuses,
    (): EntityStore<T> => {
      const entityRootEnabled = (statuses & Statuses.EntityRootEnabled) === Statuses.EntityRootEnabled;

      if (entityRootEnabled) {
        const { current: createEntityList } = createEntityListRef;

        createEntityListRef.current = initStore(store, entityArg, createEntityList, isInitializing);
      }

      return store;
    },
    deps,
  );
};
