import { OptionsRefCollection } from '@/hooks/useOptionsRefCollection/types';
import { UseCaseHookOptions } from '../../hooks/useUseCase/types';
import { triggerWatchers } from '../triggerWatchers';

export const triggerCallbacks = <
  T,
  TUseCaseOptions extends object,
  TOptions extends UseCaseHookOptions<T, TUseCaseOptions> = UseCaseHookOptions<T, TUseCaseOptions>
>(
  optionsRefCollection: OptionsRefCollection<TOptions>,
  newEntity: T,
  oldEntity: T
): void => {
  for (let { length: i } = optionsRefCollection; i > 0; i--) {
    const { current: options } = optionsRefCollection[i - 1];

    if (!options) {
      continue;
    }

    const { onChange, watch } = options;

    if (watch) {
      triggerWatchers(watch, newEntity, oldEntity);
    }

    onChange?.(newEntity, oldEntity);
  }
};
