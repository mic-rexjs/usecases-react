import { EntityReducers } from '@mic-rexjs/usecases';

export interface LifeCycleUseCaseOptions<T> {
  onBind?(entity: T): void;

  onUnbind?(entity: T): void;
}

export type LifeCycleReducers<T> = EntityReducers<
  T,
  {
    bindEntity(entity: T): void;

    unbindEntity(entity: T): void;
  }
>;
