import { useContextualItem } from '../useContextualItem';
import { createEntityReducers, EntityStore } from '@mic-rexjs/usecases';
import { EntityReducers, EntityUseCase, ReducerMap, UseCase } from '@mic-rexjs/usecases/es/types';
import { useContext } from 'react';
import { Statuses } from '@/enums/Statuses';
import { Dependencies } from '@/types';
import { UseCaseContext, UseCaseContextValue } from '@/usecases/contextUseCase/types';

export const useReducers = <T, TReducers extends ReducerMap, TOptions extends object>(
  usecase: UseCase<TReducers, TOptions> | EntityUseCase<T, TReducers & EntityReducers<T>, TOptions>,
  store: EntityStore<T>,
  context: UseCaseContext<UseCaseContextValue<TReducers>>,
  statuses: Statuses,
  usecaseOptions: TOptions,
  deps: Dependencies = [],
): TReducers => {
  const contextValue = useContext(context);
  const { reducers: contextReducers = null } = contextValue || {};
  const entityEnabled = (statuses & Statuses.EntityEnabled) === Statuses.EntityEnabled;

  const onCreate = (): TReducers => {
    if (!entityEnabled) {
      return usecase(usecaseOptions);
    }

    return createEntityReducers(
      store,
      usecase as EntityUseCase<T, EntityReducers<T>, TOptions>,
      {
        options: usecaseOptions,
        onGenerate<TResult>(newEntity: T, result: TResult): TResult {
          return result;
        },
      } as TOptions,
    );
  };

  return useContextualItem(contextReducers, statuses, onCreate, deps);
};
