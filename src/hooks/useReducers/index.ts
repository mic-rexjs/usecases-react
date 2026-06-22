import { useConstantReducers } from '../useConstantReducers';
import { useContextualItem } from '../useContextualItem';
import { UseCaseHookOptions } from '../useUseCase/types';
import { createEntityReducers, EntityStore } from '@mic-rexjs/usecases';
import { EntityReducers, EntityUseCase, ReducerMap, RestArguments, UseCase } from '@mic-rexjs/usecases/es/types';
import { useLatest } from 'ahooks';
import { useContext } from 'react';
import { Statuses } from '@/enums/Statuses';
import { Dependencies } from '@/types';
import { UseCaseContext, UseCaseContextValue } from '@/usecases/contextUseCase/types';
import { methodUseCase } from '@/usecases/methodUseCase';

export const useReducers = <T, TReducers extends ReducerMap, TUseCaseOptions extends object>(
  usecase: UseCase<TReducers, TUseCaseOptions> | EntityUseCase<T, TReducers & EntityReducers<T>, TUseCaseOptions>,
  context: UseCaseContext<UseCaseContextValue<TReducers>>,
  store: EntityStore<T>,
  statuses: Statuses,
  options: TUseCaseOptions,
  deps: Dependencies = [],
): TReducers => {
  const optionsRef = useLatest(options);
  const contextValue = useContext(context);
  const { reducers: contextReducers = null } = contextValue || {};
  const { captureCalls } = useConstantReducers(methodUseCase);

  return useContextualItem(
    contextReducers,
    statuses,
    (): TReducers => {
      const opts = captureCalls(options, <TReturn>(key: string, callArgs: RestArguments): TReturn => {
        return (optionsRef.current as Record<string, (...args: RestArguments) => TReturn>)[key]?.(...callArgs);
      });

      if ((statuses & Statuses.EntityEnabled) !== Statuses.EntityEnabled) {
        return usecase(opts as TUseCaseOptions);
      }

      const hookOptions = opts as UseCaseHookOptions<T, TUseCaseOptions>;
      const { watch, onChange, options: usecaseOptions, ...restUseCaseOptions } = hookOptions;

      return createEntityReducers(
        store,
        usecase as EntityUseCase<T, EntityReducers<T>, TUseCaseOptions>,
        {
          ...restUseCaseOptions,
          ...usecaseOptions,
          onGenerate<TResult>(newEntity: T, result: TResult): TResult {
            return result;
          },
        } as TUseCaseOptions,
      );
    },
    deps,
  );
};
