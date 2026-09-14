import { lifecycleEventUseCase } from '../lifecycleEventUseCase';
import { LifecycleReducers, LifecycleUseCaseOptions } from './types';
import { entityUseCase } from '@mic-rexjs/usecases';

export const lifecycleUseCase = <T>(options: LifecycleUseCaseOptions<T> = {}): LifecycleReducers<T> => {
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
