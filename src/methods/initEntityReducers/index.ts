import { EntityReducers, EntityStore, EntityUseCase, createEntityReducers } from '@mic-rexjs/usecases';
import { UseCaseHookOptions } from '../../hooks/useUseCase/types';
import { ContextualEntityReducers } from '@/configs/defaultUseCaseContext/types';

export const initEntityReducers = <
  T,
  TEntityReducers extends EntityReducers<T>,
  TUseCaseOptions extends object = object,
>(
  usecase: EntityUseCase<T, TEntityReducers, TUseCaseOptions>,
  store: EntityStore<T>,
  options: UseCaseHookOptions<T, TUseCaseOptions>,
): ContextualEntityReducers<T, TEntityReducers> => {
  const { onChange, options: usecaseOptions, ...restUseCaseOptions } = options;

  return createEntityReducers(
    store,
    usecase as EntityUseCase<T, TEntityReducers, TUseCaseOptions>,
    {
      ...restUseCaseOptions,
      ...usecaseOptions,
      onGenerate<TResult>(newEntity: T, result: TResult): TResult {
        return result;
      },
    } as TUseCaseOptions,
  );
};
