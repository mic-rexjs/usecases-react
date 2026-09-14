import { lifecycleEventUseCase } from '../lifecycleEventUseCase';
import { LifeCycleReducers, LifeCycleUseCaseOptions } from './types';
import { entityUseCase } from '@mic-rexjs/usecases';

export const lifeCycleUseCase = <T>(options: LifeCycleUseCaseOptions<T> = {}): LifeCycleReducers<T> => {
  const { onBind, onUnbind, onChange, onUpdate } = options;
  const { setLifecycleEvents } = lifecycleEventUseCase();
  const entityReducers = entityUseCase();

  setLifecycleEvents({
    onBind,
    onUnbind,
    onChange,
    onUpdate,
  });

  return {
    ...entityReducers,
  };
};
