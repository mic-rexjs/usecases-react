import { EntityStore } from '@mic-rexjs/usecases';
import { ReducerMap } from '@mic-rexjs/usecases/es/types';
import { useCreation } from 'ahooks';
import { OptionsSet } from '@/classes/OptionsSet';
import { Statuses } from '@/enums/Statuses';
import { UseCaseContextValue } from '@/usecases/contextUseCase/types';

export const useContextValue = <T, TReducers extends ReducerMap>(
  store: EntityStore<T>,
  reducers: TReducers,
  optionsSet: OptionsSet,
  statuses: Statuses,
): UseCaseContextValue<TReducers> => {
  const { value: entity } = store;

  return useCreation((): UseCaseContextValue<TReducers> => {
    void entity;

    if ((statuses & Statuses.EntityEnabled) === Statuses.EntityEnabled) {
      return {
        store,
        reducers,
        optionsSet,
        statuses,
      } as UseCaseContextValue<TReducers>;
    }

    return { reducers, statuses };
  }, [entity, store, reducers, optionsSet, statuses]);
};
