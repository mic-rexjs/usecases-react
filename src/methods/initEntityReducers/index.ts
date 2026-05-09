import { UseCaseHookOptions } from '../../hooks/useUseCase/types';
import { createEntityReducers, EntityStore } from '@mic-rexjs/usecases';
import { EntityReducerMap, InferableEntityUseCase } from '@mic-rexjs/usecases/es/types';
import { ContextualEntityReducers } from '@/usecases/contextUseCase/types';

export const initEntityReducers = <
  T,
  TEntityReducers extends EntityReducerMap<T>,
  TUseCaseOptions extends object = object,
>(
  usecase: InferableEntityUseCase<T, TEntityReducers, TUseCaseOptions>,
  store: EntityStore<T>,
  options: UseCaseHookOptions<T, TUseCaseOptions>,
): ContextualEntityReducers<T, TEntityReducers> => {
  const { watch, onChange, options: usecaseOptions, ...restUseCaseOptions } = options;

  return createEntityReducers(store, usecase, {
    ...restUseCaseOptions,
    ...usecaseOptions,
    onGenerate<TResult>(newEntity: T, result: TResult): TResult {
      return result;
    },
  } as TUseCaseOptions);
};
