import { ChangeCallback } from '@/configs/defaultUseCaseContext/types';

export const triggerCallbacks = <T>(callbacks: ChangeCallback<T>[], newEntity: T, oldEntity: T): void => {
  for (let { length: i } = callbacks; i > 0; i--) {
    callbacks[i - 1](newEntity, oldEntity);
  }
};
