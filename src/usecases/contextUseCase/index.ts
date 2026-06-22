import { ContextReducers, ContextUseCase, UseCaseContext, UseCaseContextReference, UseCaseContextValue } from './types';
import { createUseCase, EntityStore } from '@mic-rexjs/usecases';
import { InferableUseCase, ReducerMap } from '@mic-rexjs/usecases/es/types';
import { createContext } from 'react';
import { ArgumentTypes } from '@/enums/ArgumentTypes';
import { Statuses } from '@/enums/Statuses';

export const contextUseCase = createUseCase((): ContextUseCase => {
  const referenceMap = new Map();
  const defaultUseCaseContext = createContext(null);

  return (): ContextReducers => {
    const createContextValue = <T, TReducers extends ReducerMap>(
      store: EntityStore<T>,
      reducers: TReducers,
      statuses: Statuses,
    ): UseCaseContextValue<TReducers> => {
      if ((statuses & Statuses.EntityEnabled) === Statuses.EntityEnabled) {
        return {
          store,
          reducers,
          statuses,
        } as UseCaseContextValue<TReducers>;
      }

      return { reducers, statuses };
    };

    const getUseCaseContext = <T extends ReducerMap, TUseCaseOptions extends object>(
      usecase: InferableUseCase<T, TUseCaseOptions>,
    ): UseCaseContext<UseCaseContextValue<T>> => {
      if (!referenceMap.has(usecase)) {
        return defaultUseCaseContext as UseCaseContext<UseCaseContextValue<T>>;
      }

      const { value } = referenceMap.get(usecase) as UseCaseContextReference<UseCaseContextValue<T>>;

      return value;
    };

    const registerUseCase = <T extends ReducerMap, TUseCaseOptions extends object>(
      usecase: InferableUseCase<T, TUseCaseOptions>,
      argumentTypes: ArgumentTypes,
    ): UseCaseContext<UseCaseContextValue<T>> => {
      if (referenceMap.has(usecase)) {
        const reference = referenceMap.get(usecase) as UseCaseContextReference<UseCaseContextValue<T>>;
        const { value, times } = reference;

        referenceMap.set(usecase, {
          value,
          times: times + 1,
        });

        return value;
      }

      if ((argumentTypes & ArgumentTypes.Entity) !== ArgumentTypes.Entity) {
        return defaultUseCaseContext as UseCaseContext<UseCaseContextValue<T>>;
      }

      const context = createContext(null) as UseCaseContext<UseCaseContextValue<T>>;

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

      const reference = referenceMap.get(usecase) as UseCaseContextReference<UseCaseContextValue<T>>;
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
