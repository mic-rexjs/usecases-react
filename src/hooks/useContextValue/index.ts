import { useReturn } from '../useReturn';
import { EntityStore } from '@mic-rexjs/usecases';
import { useId } from 'react';
import { Statuses } from '@/enums/Statuses';
import { UnknownReducerMap } from '@/types';
import { ContextualEntityReducers, EntityUseCaseContextValue } from '@/usecases/contextUseCase/types';

export const useContextValue = <T, TReducers extends UnknownReducerMap<T>>(
  entity: T,
  store: EntityStore<T>,
  reducers: TReducers | ContextualEntityReducers<T, TReducers>,
  statuses: Statuses,
): EntityUseCaseContextValue<T, TReducers> => {
  const key = useId();

  return useReturn((): EntityUseCaseContextValue<T, TReducers> => {
    return {
      key,
      store,
      reducers: reducers as ContextualEntityReducers<T, TReducers>,
      statuses,
    };
  }, [key, entity, store, reducers, statuses]);
};
