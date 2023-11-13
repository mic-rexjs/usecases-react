import { EntityReducers, EntityUseCase } from '@mic-rexjs/usecases';
import { useConstant } from '../useConstant';
import { UseCaseContextMap, UseCaseMappingContext } from '@/configs/usecaseContextMap/types';
import { usecaseContextMap } from '@/configs/usecaseContextMap';
import { createContext } from 'react';
import { UseCaseContextValue } from '@/configs/defaultUseCaseContext/types';

export const useUseCaseContext = <
  T,
  TEntityReducers extends EntityReducers<T>,
  TUseCaseOptions extends object,
  TContext extends UseCaseMappingContext<T, TEntityReducers, TUseCaseOptions> = UseCaseMappingContext<
    T,
    TEntityReducers,
    TUseCaseOptions
  >
>(
  usecase: EntityUseCase<T, TEntityReducers, TUseCaseOptions>,
  defaultContext?: TContext | null
): TContext => {
  return useConstant((): TContext => {
    const map = usecaseContextMap as UseCaseContextMap<T, TEntityReducers, TUseCaseOptions>;

    if (map.has(usecase)) {
      return map.get(usecase) as TContext;
    }

    if (defaultContext) {
      return defaultContext;
    }

    const ctx = createContext<UseCaseContextValue<T, TEntityReducers, TUseCaseOptions>>({}) as TContext;

    map.set(usecase, ctx);
    return ctx;
  });
};
