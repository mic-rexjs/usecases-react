import { useLatest, useMemoizedFn } from 'ahooks';
import React, { Context, createContext, useContext, useMemo, useRef, useState } from 'react';
import { EntityReducers, EntityUseCase, Reducers, UseCase } from '@rex-js/usecases/es/types';
import { UseCaseHookOptions, UseCaseHook, EntityGetter } from './types';
import { defaultUseCaseContext } from '../../configs/defaultUseCaseContext';
import { usecaseContextMap } from '../../configs/usecaseContextMap';
import {
  ContextualEntityReducers,
  UseCaseContext,
  UseCaseContextMap,
  UseCaseContextWithCollectionReducers,
  UseCaseContextWithProvider,
} from '../../configs/usecaseContextMap/types';
import {
  OptionsGetter,
  OptionsGetterCollectionReducers,
} from '../../core/usecases/optionsGetterCellectionUseCase/types';
import { optionsGetterCollectionUseCase } from '../../core/usecases/optionsGetterCellectionUseCase';
import { triggerCallbacks } from './methods/triggerCallbacks';
import { useOptionsTransfer } from '../useOptionsTransfer';
import { entityReducerUseCase } from '@rex-js/usecases';

export const useUseCase = (<
  T,
  TReducers extends Reducers,
  TEntityReducers extends EntityReducers<T>,
  TUseCaseOptions extends object,
  TOptions extends UseCaseHookOptions<T, TUseCaseOptions> = UseCaseHookOptions<T, TUseCaseOptions>
>(
  arg1: T | EntityGetter<T> | UseCase<TReducers> | EntityUseCase<T, TEntityReducers>,
  arg2?: EntityUseCase<T, TEntityReducers, TUseCaseOptions> | TUseCaseOptions,
  arg3?: TOptions | unknown[],
  arg4?: unknown[]
): TReducers | UseCaseContext<T, TEntityReducers> | UseCaseContextWithProvider<T, TEntityReducers> => {
  const [hasDefaultEntity] = useState(typeof arg2 === 'function');
  const [entityState, setEntityState] = useState(hasDefaultEntity ? (arg1 as T | EntityGetter<T>) : null);
  const options = ((hasDefaultEntity ? arg3 : arg2) as TOptions) || {};
  const { stateless, watch, onChange, ...entityUseCaseOptions } = options;
  const optionsGetterListRef = useRef<OptionsGetter<TOptions>[]>([]);
  const deps = ((hasDefaultEntity ? arg4 : arg3) as unknown[]) || [];

  const [usecase] = useState((): UseCase<TReducers> | EntityUseCase<T, TEntityReducers, TUseCaseOptions> => {
    return hasDefaultEntity
      ? (arg2 as EntityUseCase<T, TEntityReducers, TUseCaseOptions>)
      : (arg1 as UseCase<TReducers> | EntityUseCase<T, TEntityReducers>);
  });

  const [context] = useState(<
    TContext extends Context<UseCaseContextWithCollectionReducers<T, TEntityReducers, TOptions> | null>
  >(): TContext => {
    const map = usecaseContextMap as UseCaseContextMap<T, TEntityReducers, TOptions>;
    const entityUseCase = usecase as EntityUseCase<T, TEntityReducers>;

    if (map.has(entityUseCase)) {
      return map.get(entityUseCase) as TContext;
    }

    if (!hasDefaultEntity) {
      return defaultUseCaseContext as TContext;
    }

    const ctx = createContext(null) as TContext;

    map.set(entityUseCase, ctx);
    return ctx;
  });

  const [contextEntity, contextEntityReducers, contextCollectionReducers] = useContext(context) || [];

  const entity = useMemo((): T => {
    if (!hasDefaultEntity) {
      return contextEntity as T;
    }

    if (!stateless) {
      return entityState as T;
    }

    if (typeof arg1 !== 'function') {
      return arg1;
    }

    return (arg1 as EntityGetter<T>)();
  }, [hasDefaultEntity, contextEntity, stateless, entityState, arg1]);

  const initReducers = useMemoizedFn((): TReducers | ContextualEntityReducers<TEntityReducers> => {
    if (!hasDefaultEntity) {
      return contextEntityReducers || (usecase as UseCase<TReducers>)(options);
    }

    const { createEntityReducers } = entityReducerUseCase();

    return createEntityReducers(entity, usecase as EntityUseCase<T, TEntityReducers, TUseCaseOptions>, {
      ...(entityUseCaseOptions as TUseCaseOptions),
      onChange(newEntity: T, prevEntity: T): void {
        if (hasDefaultEntity && !stateless) {
          setEntityState(newEntity);
        }

        triggerCallbacks(optionsGetterListRef.current, newEntity, prevEntity);
      },
      onGenerate<TResult>(newEntity: T, result: TResult): TResult {
        return result;
      },
    });
  });

  const reducers = useMemo.call(null, initReducers, [entity, initReducers, ...deps]);

  const collectionReducers = useMemo((): OptionsGetterCollectionReducers<TOptions> => {
    if (!hasDefaultEntity && contextCollectionReducers) {
      return contextCollectionReducers;
    }

    return optionsGetterCollectionUseCase(optionsGetterListRef.current);
  }, [hasDefaultEntity, contextCollectionReducers]);

  const contextValueWithCollectionReducers = useMemo((): UseCaseContextWithCollectionReducers<
    T,
    TEntityReducers,
    TOptions
  > => {
    return [entity, reducers as ContextualEntityReducers<TEntityReducers>, collectionReducers];
  }, [entity, reducers, collectionReducers]);

  const contextValueWithCollectionReducersRef = useLatest(contextValueWithCollectionReducers);

  const [Provider] = useState((): React.FC => {
    return ({ children }: React.PropsWithChildren): React.ReactElement => {
      const { Provider: ContextProvider } = context;

      return React.createElement(
        ContextProvider,
        {
          value: contextValueWithCollectionReducersRef.current,
        },
        children
      );
    };
  });

  const contextValue = useMemo(():
    | UseCaseContext<T, TEntityReducers>
    | UseCaseContextWithProvider<T, TEntityReducers> => {
    if (hasDefaultEntity) {
      return [entity, reducers as ContextualEntityReducers<TEntityReducers>, Provider];
    }

    return [entity, reducers as ContextualEntityReducers<TEntityReducers>];
  }, [entity, reducers, hasDefaultEntity, Provider]);

  const result = useMemo(():
    | TReducers
    | UseCaseContext<T, TEntityReducers>
    | UseCaseContextWithProvider<T, TEntityReducers> => {
    if (context === defaultUseCaseContext) {
      return reducers as TReducers;
    }

    return contextValue;
  }, [context, reducers, contextValue]);

  void useOptionsTransfer(options, collectionReducers);
  return result;
}) as UseCaseHook;
