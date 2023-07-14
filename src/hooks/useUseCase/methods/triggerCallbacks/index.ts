import { OptionsGetter } from '@/core/usecases/optionsGetterCellectionUseCase/types';
import { UseCaseHookOptions } from '../../types';
import { triggerWatchers } from '../triggerWatchers';

export const triggerCallbacks = <T, TOptions extends object>(
  getterList: OptionsGetter<UseCaseHookOptions<T, TOptions>>[],
  newEntity: T,
  prevEntity: T
): void => {
  for (const getter of getterList) {
    const { onChange, watch } = getter();

    onChange?.(newEntity, prevEntity);

    if (!watch) {
      continue;
    }

    triggerWatchers(watch, newEntity, prevEntity);
  }
};
