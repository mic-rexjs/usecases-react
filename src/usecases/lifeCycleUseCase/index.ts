import { LifeCycleReducers, LifeCycleUseCaseOptions } from './types';
import { entityUseCase } from '@mic-rexjs/usecases';

export const lifeCycleUseCase = <T>(options: LifeCycleUseCaseOptions<T> = {}): LifeCycleReducers<T> => {
  const { onBind, onUnbind } = options;
  const entityReducers = entityUseCase();

  const bindEntity = <S extends T>(entity: S): S | void => {
    return onBind?.(entity);
  };

  const unbindEntity = (entity: T): void => {
    onUnbind?.(entity);
  };

  return {
    ...entityReducers,
    bindEntity,
    unbindEntity,
  };
};
