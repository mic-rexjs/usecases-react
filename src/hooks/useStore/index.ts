import { useConstantEntityReducers } from '../useConstantEntityReducers';
import { useContextualItem } from '../useContextualItem';
import { UseCaseHookOptions } from '../useUseCase/types';
import { EntityReducers, EntityStore } from '@mic-rexjs/usecases';
import { useContext, useRef } from 'react';
import { Statuses } from '@/enums/Statuses';
import { initStore } from '@/methods/initStore';
import { Dependencies, EntityInitializer } from '@/types';
import { EntityUseCaseContextValue, UseCaseContext } from '@/usecases/contextUseCase/types';
import { valueUseCase } from '@/usecases/valueUseCase';

export const useStore = <
  T,
  TUseCaseOptions extends object,
  TOptions extends UseCaseHookOptions<T, TUseCaseOptions> = UseCaseHookOptions<T, TUseCaseOptions>,
>(
  entityArg: T | EntityInitializer<T>,
  context: UseCaseContext<EntityUseCaseContextValue<T, EntityReducers<T>>>,
  statuses: Statuses,
  options: TOptions,
  deps: Dependencies = [],
): EntityStore<T> => {
  const storeRef = useRef<EntityStore<T>>(null);
  const entityRootEnabled = (statuses & Statuses.EntityRootEnabled) === Statuses.EntityRootEnabled;
  const contextValue = useContext(context);
  const { store: contextStore = null } = contextValue || {};
  const { recordValueDiff } = useConstantEntityReducers([], valueUseCase<Dependencies>);

  return useContextualItem(
    contextStore,
    statuses,
    (): EntityStore<T> => {
      if (!entityRootEnabled) {
        return new EntityStore<T>(null as T);
      }

      const { current } = storeRef;
      const [, changedDeps] = recordValueDiff(deps);
      const newStore = initStore(entityArg, current, changedDeps);

      storeRef.current = newStore;
      return newStore;
    },
    deps,
  );
};
