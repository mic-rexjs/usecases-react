import { useReturn } from '../useReturn';
import { ContextualUseCaseHookOptions, UseCaseHookOptions } from '../useUseCase/types';
import { createEntityReducers, EntityStore } from '@mic-rexjs/usecases';
import { EntityReducers, EntityUseCase, RestArguments, UseCase } from '@mic-rexjs/usecases/es/types';
import { useLatest } from 'ahooks';
import { useContext } from 'react';
import { Statuses } from '@/enums/Statuses';
import { UnknownReducerMap } from '@/types';
import { ContextualEntityReducers, EntityUseCaseContextValue, UseCaseContext } from '@/usecases/contextUseCase/types';

export const useReducers = <T, TReducers extends UnknownReducerMap<T>, TOptions extends object>(
  usecase: UseCase<TReducers, TOptions> | EntityUseCase<T, TReducers, TOptions>,
  store: EntityStore<T>,
  context: UseCaseContext<EntityUseCaseContextValue<T, TReducers>>,
  statuses: Statuses,
  options: TOptions | UseCaseHookOptions<T, TOptions> | ContextualUseCaseHookOptions<T>,
): TReducers | ContextualEntityReducers<T, TReducers> => {
  const contextValue = useContext(context);
  const { reducers: contextReducers = null } = contextValue || {};
  const { watch, onChange, ...restOptions } = options as UseCaseHookOptions<T, TOptions>;
  const { options: initailOptions = restOptions as TOptions } = options as UseCaseHookOptions<T, TOptions>;
  const initailOptionsRef = useLatest(initailOptions);
  const reducersKey = statuses & Statuses.ReducersKey;

  const onOption = <K extends keyof TOptions>(key: K): TOptions[K] => {
    return (<TReturn>(...args: RestArguments): void | TReturn => {
      const { current: currentInitailOptions } = initailOptionsRef;
      const currentValue = currentInitailOptions[key];

      if (typeof currentValue !== 'function') {
        return;
      }

      return currentValue(...args);
    }) as TOptions[K];
  };

  const onOptions = (): TOptions => {
    const newOptions = { ...initailOptions };

    for (const key of Object.keys(newOptions)) {
      const optionKey = key as keyof TOptions;
      const value = newOptions[optionKey];

      if (typeof value !== 'function') {
        continue;
      }

      newOptions[optionKey] = onOption(optionKey);
    }

    return newOptions;
  };

  return useReturn((): TReducers | ContextualEntityReducers<T, TReducers> => {
    const hasEntity = (statuses & Statuses.Entity) === Statuses.Entity;
    const isEntityRootRuntime = (statuses & Statuses.EntityRootRuntime) === Statuses.EntityRootRuntime;

    if (!hasEntity) {
      return usecase(options as TOptions);
    }

    if (!isEntityRootRuntime) {
      return contextReducers!;
    }

    const newOptions = onOptions();

    return createEntityReducers(
      store,
      usecase as EntityUseCase<T, TReducers & EntityReducers<T>, TOptions>,
      {
        options: newOptions,
        onGenerate<TResult>(newEntity: T, result: TResult): TResult {
          return result;
        },
      } as TOptions,
    );
  }, [reducersKey]);
};
