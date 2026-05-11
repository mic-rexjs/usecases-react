import { useConstant } from '../useConstant';
import { createEntityReducers } from '@mic-rexjs/usecases';
import {
  CreateEntityReducersOptions,
  ScopedEntityReducers,
} from '@mic-rexjs/usecases/es/methods/createEntityReducers/types';
import { EntityReducerMap, EntityReducers, InferableEntityUseCase } from '@mic-rexjs/usecases/es/types';

export const useConstantEntityReducers = <
  T,
  TEntityReducers extends EntityReducerMap<T>,
  TUseCaseOptions extends object = object,
>(
  initailEntity: T,
  usecase: InferableEntityUseCase<T, TEntityReducers & EntityReducers<T>, TUseCaseOptions>,
  options?: CreateEntityReducersOptions<T, TUseCaseOptions>,
): ScopedEntityReducers<T, EntityReducers<T, TEntityReducers>> => {
  return useConstant((): ScopedEntityReducers<T, TEntityReducers> => {
    return createEntityReducers(initailEntity, usecase, options);
  });
};
