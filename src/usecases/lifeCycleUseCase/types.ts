import { EntityReducers } from '@mic-rexjs/usecases';

export interface LifeCycleUseCaseOptions<T> {
  onBind?<S extends T>(entity: S): S | void;

  onUnbind?(entity: T): void;
}

export type LifeCycleReducers<T> = EntityReducers<
  T,
  {
    bindEntity<S extends T>(entity: S): S | void;

    unbindEntity(entity: T): void;
  }
>;
