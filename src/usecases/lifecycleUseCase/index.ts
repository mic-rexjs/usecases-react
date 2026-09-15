import { lifecycleEventUseCase } from '../lifecycleEventUseCase';
import { LifecycleReducers, LifecycleUseCaseOptions } from './types';
import { entityUseCase } from '@mic-rexjs/usecases';

export const lifecycleUseCase = <T>(options: LifecycleUseCaseOptions<T> = {}): LifecycleReducers<T> => {
  const { onAdopt, onDiscard, onBind, onUnbind, onChange, onUpdate } = options;
  const { setLifecycleEvents } = lifecycleEventUseCase();
  const entityReducers = entityUseCase();

  setLifecycleEvents({
    onAdopt,
    onDiscard,
    onBind,
    onUnbind,
    onChange,
    onUpdate,
  });

  return {
    ...entityReducers,
  };
};
