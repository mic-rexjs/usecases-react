import { createUseCase, EntityStore } from '@mic-rexjs/usecases';
import { Context, ContextReducers, ContextReference, ContextUseCase, ContextValue } from './types';
import { ArgumentTypes } from '@/enums/ArgumentTypes';
import { createContext } from 'react';
import { Statuses } from '@/enums/Statuses';
import { EntityReducerMap, InferableEntityUseCase, InferableUseCase, ReducerMap } from '@mic-rexjs/usecases/es/types';
import { initEntityReducers } from '@/methods/initEntityReducers';

export const contextUseCase = createUseCase((): ContextUseCase => {
  const referenceMap = new Map();
  const globalContextMap = new Map();
  const globalContextValueMap = new Map();
  const defaultUseCaseContext = createContext(null);

  return (): ContextReducers => {
    const createContextValue = <T, TReducers extends ReducerMap>(
      store: EntityStore<T>,
      reducers: TReducers,
      statuses: Statuses,
    ): ContextValue<TReducers> => {
      if ((statuses & Statuses.EntityEnabled) === Statuses.EntityEnabled) {
        return {
          store,
          reducers,
          statuses,
        } as ContextValue<TReducers>;
      }

      return { reducers, statuses };
    };

    const getGlobalContextValue = <
      T,
      TEntityReducers extends EntityReducerMap<T>,
      TContextValue extends ContextValue<TEntityReducers> = ContextValue<TEntityReducers>,
    >(
      key: Context<TContextValue> | InferableEntityUseCase<T, TEntityReducers>,
    ): TContextValue | null => {
      const context = typeof key === 'function' ? (globalContextMap.get(key) as Context<TContextValue>) : key;

      return globalContextValueMap.get(context) || null;
    };

    const isGlobal = <T>(usecase: InferableEntityUseCase<T>): boolean => {
      return globalContextMap.has(usecase);
    };

    const registerUseCase = <
      T extends ReducerMap,
      TUseCaseOptions extends object,
      TContext extends Context<ContextValue<T>> = Context<ContextValue<T>>,
    >(
      usecase: InferableUseCase<T, TUseCaseOptions>,
      argumentTypes: ArgumentTypes,
    ): TContext => {
      if (referenceMap.has(usecase)) {
        const reference = referenceMap.get(usecase) as ContextReference<ContextValue<T>>;
        const { value, times } = reference;

        referenceMap.set(usecase, {
          value,
          times: times + 1,
        });

        return value as TContext;
      }

      if ((argumentTypes & ArgumentTypes.Entity) !== ArgumentTypes.Entity) {
        return defaultUseCaseContext as TContext;
      }

      const context = createContext(null) as TContext;

      referenceMap.set(usecase, {
        value: context,
        times: 1,
      });

      return context;
    };

    const unregisterUseCase = <T extends ReducerMap, TUseCaseOptions extends object>(
      usecase: InferableUseCase<T, TUseCaseOptions>,
      argumentTypes: ArgumentTypes,
    ): boolean => {
      if ((argumentTypes & ArgumentTypes.Entity) !== ArgumentTypes.Entity) {
        return false;
      }

      if (!referenceMap.has(usecase)) {
        return false;
      }

      const reference = referenceMap.get(usecase) as ContextReference<ContextValue<T>>;
      const { value, times } = reference;

      if (times === 1) {
        referenceMap.delete(usecase);
      } else {
        referenceMap.set(usecase, {
          value,
          times: times - 1,
        });
      }

      return true;
    };

    const registerGlobalUseCase = <T>(entity: T, usecase: InferableEntityUseCase<T>): void => {
      if (globalContextMap.has(usecase)) {
        return;
      }

      const store = new EntityStore(entity);
      const reducers = initEntityReducers(usecase, store, {});
      const contextValue = createContextValue(store, reducers, Statuses.GlobalEnabled);
      const context = registerUseCase(usecase, ArgumentTypes.GlobalEntity);

      globalContextMap.set(usecase, context);
      globalContextValueMap.set(context, contextValue);
    };

    const unregisterGlobalUseCase = <T>(usecase: InferableEntityUseCase<T>): boolean => {
      if (!globalContextMap.has(usecase)) {
        return false;
      }

      const context = globalContextMap.get(usecase);

      globalContextMap.delete(usecase);
      globalContextValueMap.delete(context);
      referenceMap.delete(usecase);
      return true;
    };

    return {
      createContextValue,
      getGlobalContextValue,
      isGlobal,
      registerUseCase,
      registerGlobalUseCase,
      unregisterUseCase,
      unregisterGlobalUseCase,
    };
  };
});
