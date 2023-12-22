import { EntityReducers, EntityUseCase, createEntityReducers } from '@mic-rexjs/usecases';
import { UseCaseHookOptions } from '../../hooks/useUseCase/types';
import { ContextualEntityReducers } from '@/configs/defaultUseCaseContext/types';
import { EntityChangeEventHandler } from './types';

export const initEntityReducers = <
  T,
  TEntityReducers extends EntityReducers<T>,
  TUseCaseOptions extends object = object
>(
  entity: T,
  usecase: EntityUseCase<T, TEntityReducers, TUseCaseOptions>,
  options: UseCaseHookOptions<T, TUseCaseOptions>,
  onEntityChange: EntityChangeEventHandler<T>
): ContextualEntityReducers<T, TEntityReducers> => {
  const { watch, onChange, options: usecaseOptions, ...restUseCaseOptions } = options;

  return createEntityReducers(
    entity,
    usecase as EntityUseCase<T, TEntityReducers, TUseCaseOptions>,
    {
      ...restUseCaseOptions,
      ...usecaseOptions,
      onChange: onEntityChange,
      onGenerate<TResult>(newEntity: T, result: TResult): TResult {
        return result;
      },
    } as TUseCaseOptions
  );
};
