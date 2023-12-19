import { ChangeCallback } from '@/configs/defaultUseCaseContext/types';

export const triggerCallbacks = <T>(
  changeCallbackCollection: ChangeCallback<T>[],
  newEntity: T,
  oldEntity: T
): void => {
  for (let { length: i } = changeCallbackCollection; i > 0; i--) {
    changeCallbackCollection[i - 1](newEntity, oldEntity);
  }
};
