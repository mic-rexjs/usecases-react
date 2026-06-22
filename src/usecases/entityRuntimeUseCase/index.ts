import { EntityRuntimeReducers, EntityRuntimeUseCaseOptions } from './types';
import { entityUseCase } from '@mic-rexjs/usecases';
import { InitEntityResult } from '@/types';

export const entityRuntimeUseCase = <T>(options: EntityRuntimeUseCaseOptions<T> = {}): EntityRuntimeReducers<T> => {
  const entityReducers = entityUseCase();
  const { onInit } = options;

  const initEntity = <S extends T>(entity: S): InitEntityResult<S> => {
    if (typeof onInit !== 'function') {
      return entity;
    }

    return onInit(entity) as InitEntityResult<S>;
  };

  return {
    ...entityReducers,
    initEntity,
  };
};
