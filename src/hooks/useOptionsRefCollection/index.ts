import { useCreation, useLatest, usePrevious, useUnmount } from 'ahooks';
import { UseCaseHookOptions } from '../useUseCase/types';
import { OptionsRefCollection } from './types';
import { removeItem } from '@/methods/removeItem';

export const useOptionsRefCollection = <
  T,
  TUseCaseOptions extends object,
  TOptions extends UseCaseHookOptions<T, TUseCaseOptions> = UseCaseHookOptions<T, TUseCaseOptions>
>(
  isRoot: boolean,
  contextOptionsRefCollection: OptionsRefCollection<TOptions> | null,
  options: TOptions
): OptionsRefCollection<TOptions> => {
  const optionsRef = useLatest(options);

  const optionsRefCollection = useCreation((): OptionsRefCollection<TOptions> => {
    if (isRoot) {
      return [] as OptionsRefCollection<TOptions>;
    }

    return contextOptionsRefCollection as OptionsRefCollection<TOptions>;
  }, [contextOptionsRefCollection, isRoot]);

  const prevOptionsRefCollection = usePrevious(optionsRefCollection);

  useCreation((): void => {
    if (prevOptionsRefCollection) {
      removeItem(prevOptionsRefCollection, optionsRef);
    }

    optionsRefCollection.push(optionsRef);
  }, [optionsRef, optionsRefCollection, prevOptionsRefCollection]);

  useUnmount((): void => {
    removeItem(optionsRefCollection, optionsRef);
  });

  return optionsRefCollection;
};
