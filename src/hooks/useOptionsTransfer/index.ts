import { useCreation, useMemoizedFn, usePrevious, useUnmount } from 'ahooks';
import { UseCaseHookOptions } from '../useUseCase/types';
import { OptionsGetterCollectionReducers } from '@/core/usecases/optionsGetterCellectionUseCase/types';

export const useOptionsTransfer = <T, TOptions extends object>(
  options: UseCaseHookOptions<T, TOptions>,
  optionsGetterListReducers: OptionsGetterCollectionReducers<UseCaseHookOptions<T, TOptions>>
): void => {
  const { addOptionsGetter, removeOptionsGetter } = optionsGetterListReducers;
  const prevRemoveOptionsGetter = usePrevious(removeOptionsGetter);

  const getOptions = useMemoizedFn((): UseCaseHookOptions<T, TOptions> => {
    return options;
  });

  useCreation((): void => {
    prevRemoveOptionsGetter?.(getOptions);

    addOptionsGetter(getOptions);
  }, [addOptionsGetter, prevRemoveOptionsGetter, getOptions]);

  useUnmount((): void => {
    removeOptionsGetter(getOptions);
  });
};
