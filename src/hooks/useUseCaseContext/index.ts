import { EntityReducers, EntityUseCase, UseCase } from '@mic-rexjs/usecases';
import { useConstant } from '../useConstant';
import { UseCaseContextReference, UseCaseContextReferenceMap } from '@/configs/useCaseContextReferenceMap/types';
import { usecaseContextReferenceMap } from '@/configs/useCaseContextReferenceMap';
import { createContext } from 'react';
import { UseCaseContext } from '@/configs/defaultUseCaseContext/types';
import { useUnmount } from 'ahooks';

export const useUseCaseContext = <
  T,
  TEntityReducers extends EntityReducers<T>,
  TUseCaseOptions extends object,
  TContext extends UseCaseContext<T, TEntityReducers> = UseCaseContext<T, TEntityReducers>
>(
  usecase: EntityUseCase<T, TEntityReducers, TUseCaseOptions> & UseCase<EntityReducers<T>, TUseCaseOptions>,
  defaultContext?: (TContext & UseCaseContext<T, TEntityReducers>) | null
): TContext => {
  const map = usecaseContextReferenceMap as UseCaseContextReferenceMap<T, TEntityReducers, TUseCaseOptions, TContext>;

  const context = useConstant((): TContext => {
    if (map.has(usecase)) {
      const reference = map.get(usecase) as UseCaseContextReference<T, TEntityReducers, TContext>;
      const { value, times } = reference;

      map.set(usecase, {
        value,
        times: times + 1,
      });

      return value;
    }

    if (defaultContext) {
      return defaultContext;
    }

    const ctx = createContext(null) as TContext;

    map.set(usecase, {
      value: ctx,
      times: 1,
    });

    return ctx;
  });

  useUnmount((): void => {
    if (!map.has(usecase)) {
      return;
    }

    const reference = map.get(usecase) as UseCaseContextReference<T, TEntityReducers, TContext>;
    const { value, times } = reference;

    if (context !== value) {
      return;
    }

    if (times === 1) {
      map.delete(usecase);
      return;
    }

    map.set(usecase, {
      value,
      times: times - 1,
    });
  });

  return context;
};
