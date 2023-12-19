import { useCreation, useMemoizedFn, usePrevious, useUnmount } from 'ahooks';
import { UseCaseHookOptions } from '../useUseCase/types';
import { removeItem } from '@/methods/removeItem';
import { triggerWatchers } from '@/methods/triggerWatchers';
import { ChangeCallback } from '@/configs/defaultUseCaseContext/types';

export const useChangeCallbackCollection = <
  T,
  TUseCaseOptions extends object,
  TOptions extends UseCaseHookOptions<T, TUseCaseOptions> = UseCaseHookOptions<T, TUseCaseOptions>
>(
  isRoot: boolean,
  contextCollection: ChangeCallback<T>[] | null,
  options: TOptions
): ChangeCallback<T>[] => {
  const changeCallbackCollection = useCreation((): ChangeCallback<T>[] => {
    if (isRoot) {
      return [];
    }

    return contextCollection as ChangeCallback<T>[];
  }, [contextCollection, isRoot]);

  const onEntityChange = useMemoizedFn((newEntity: T, oldEntity: T): void => {
    const { onChange, watch } = options;

    if (watch) {
      triggerWatchers(watch, newEntity, oldEntity);
    }

    onChange?.(newEntity, oldEntity);
  });

  const prevChangeCallbackCollection = usePrevious(changeCallbackCollection);

  useCreation((): void => {
    if (prevChangeCallbackCollection) {
      removeItem(prevChangeCallbackCollection, onEntityChange);
    }

    changeCallbackCollection.push(onEntityChange);
  }, [onEntityChange, changeCallbackCollection, prevChangeCallbackCollection]);

  useUnmount((): void => {
    removeItem(changeCallbackCollection, onEntityChange);
  });

  return changeCallbackCollection;
};
