import {
  ContextReducers,
  ContextUseCase,
  EntityUseCaseContextValue,
  UseCaseContext,
  UseCaseContextReference,
} from './types';
import { createUseCase } from '@mic-rexjs/usecases';
import { EntityReducerMap, EntityUseCase } from '@mic-rexjs/usecases/es/types';
import { createContext } from 'react';

export const contextUseCase = createUseCase((): ContextUseCase => {
  const referenceMap = new Map();

  return (): ContextReducers => {
    const getTypedReferenceMap = <
      T,
      TEntityReducers extends EntityReducerMap<T>,
      TUseCaseOptions extends object,
    >(): Map<
      EntityUseCase<T, TEntityReducers, TUseCaseOptions>,
      UseCaseContextReference<EntityUseCaseContextValue<T, TEntityReducers>>
    > => {
      return referenceMap;
    };

    const getContext = <T, TEntityReducers extends EntityReducerMap<T>, TUseCaseOptions extends object>(
      usecase: EntityUseCase<T, TEntityReducers, TUseCaseOptions>,
    ): UseCaseContext<EntityUseCaseContextValue<T, TEntityReducers>> => {
      const map = getTypedReferenceMap<T, TEntityReducers, TUseCaseOptions>();

      if (!map.has(usecase)) {
        return createContext(null) as UseCaseContext<EntityUseCaseContextValue<T, TEntityReducers>>;
      }

      const { value } = map.get(usecase)!;

      return value;
    };

    const registerUseCase = <T, TEntityReducers extends EntityReducerMap<T>, TUseCaseOptions extends object>(
      usecase: EntityUseCase<T, TEntityReducers, TUseCaseOptions>,
    ): UseCaseContext<EntityUseCaseContextValue<T, TEntityReducers>> => {
      const map = getTypedReferenceMap<T, TEntityReducers, TUseCaseOptions>();

      if (map.has(usecase)) {
        const reference = map.get(usecase)!;
        const { value, times } = reference;

        map.set(usecase, {
          value,
          times: times + 1,
        });

        return value;
      }

      const context = createContext(null) as UseCaseContext<EntityUseCaseContextValue<T, TEntityReducers>>;

      map.set(usecase, {
        value: context,
        times: 1,
      });

      return context;
    };

    const unregisterUseCase = <T, TEntityReducers extends EntityReducerMap<T>, TUseCaseOptions extends object>(
      usecase: EntityUseCase<T, TEntityReducers, TUseCaseOptions>,
    ): boolean => {
      const map = getTypedReferenceMap<T, TEntityReducers, TUseCaseOptions>();

      if (!map.has(usecase)) {
        return false;
      }

      const reference = map.get(usecase)!;
      const { value, times } = reference;

      if (times === 1) {
        map.delete(usecase);
      } else {
        map.set(usecase, {
          value,
          times: times - 1,
        });
      }

      return true;
    };

    return {
      getContext,
      registerUseCase,
      unregisterUseCase,
    };
  };
});
