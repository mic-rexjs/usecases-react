import { createUseCase, EntityStore } from '@mic-rexjs/usecases';
import { Context, ContextReducers, ContextReference, ContextUseCase, ContextValue } from './types';
import { ArgumentTypes } from '@/enums/ArgumentTypes';
import { createContext } from 'react';
import { Statuses } from '@/enums/Statuses';
import { InferableUseCase, ReducerMap } from '@mic-rexjs/usecases/es/types';

export const contextUseCase = createUseCase((): ContextUseCase => {
  const referenceMap = new Map();
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

    const getUseCaseContext = <T extends ReducerMap, TUseCaseOptions extends object>(
      usecase: InferableUseCase<T, TUseCaseOptions>,
    ): Context<ContextValue<T>> | null => {
      if (!referenceMap.has(usecase)) {
        return null;
      }

      const { value } = referenceMap.get(usecase) as ContextReference<ContextValue<T>>;

      return value;
    };

    const registerUseCase = <T extends ReducerMap, TUseCaseOptions extends object>(
      usecase: InferableUseCase<T, TUseCaseOptions>,
      argumentTypes: ArgumentTypes,
    ): Context<ContextValue<T>> => {
      if (referenceMap.has(usecase)) {
        const reference = referenceMap.get(usecase) as ContextReference<ContextValue<T>>;
        const { value, times } = reference;

        referenceMap.set(usecase, {
          value,
          times: times + 1,
        });

        return value;
      }

      if ((argumentTypes & ArgumentTypes.Entity) !== ArgumentTypes.Entity) {
        return defaultUseCaseContext as Context<ContextValue<T>>;
      }

      const context = createContext(null) as Context<ContextValue<T>>;

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

    return {
      createContextValue,
      getUseCaseContext,
      registerUseCase,
      unregisterUseCase,
    };
  };
});
