import { useConstant } from '../useConstant';
import { createEntityReducers } from '@mic-rexjs/usecases';
import {
  CreateEntityReducersOptions,
  ScopedEntityReducers,
} from '@mic-rexjs/usecases/es/methods/createEntityReducers/types';
import { EntityReducerMap, EntityReducers, InferableEntityUseCase } from '@mic-rexjs/usecases/es/types';
import { useCreation, useMemoizedFn } from 'ahooks';
import { Dependencies } from '@/types';
import { valueUseCase } from '@/usecases/valueUseCase';
import { ValueReducers } from '@/usecases/valueUseCase/types';

export const useEntityReducers = <
  T,
  TEntityReducers extends EntityReducerMap<T>,
  TUseCaseOptions extends object = object,
>(
  initailEntity: T,
  usecase: InferableEntityUseCase<T, TEntityReducers & EntityReducers<T>, TUseCaseOptions>,
  options?: CreateEntityReducersOptions<T, TUseCaseOptions>,
  deps: Dependencies = [],
): ScopedEntityReducers<T, EntityReducers<T, TEntityReducers>> => {
  const { recordValueMatchWith } = useConstant((): ScopedEntityReducers<Dependencies, ValueReducers<Dependencies>> => {
    return createEntityReducers(deps, valueUseCase);
  });

  const [, depsKey] = recordValueMatchWith(deps);

  const onCreate = useMemoizedFn((): ScopedEntityReducers<T, TEntityReducers> => {
    return createEntityReducers(initailEntity, usecase, options);
  });

  return useCreation((): ScopedEntityReducers<T, TEntityReducers> => {
    void depsKey;
    void usecase;

    return onCreate();
  }, [depsKey, usecase, onCreate]);
};
