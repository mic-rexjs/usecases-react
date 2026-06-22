import { EntityReducers } from '@mic-rexjs/usecases';
import { InitEntityResult } from '@/types';

export interface EntityRuntimeUseCaseOptions<T> {
  onInit?(entity: T): InitEntityResult<T>;
}

export type EntityRuntimeReducers<T> = EntityReducers<
  T,
  {
    initEntity<S extends T>(entity: S): InitEntityResult<S>;
  }
>;
