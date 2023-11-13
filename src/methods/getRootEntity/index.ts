import { EntityGetter } from '@/hooks/useUseCase/types';

export const getRootEntity = <T>(entityState: T, entityArg: T | EntityGetter<T>, stateless?: boolean): T => {
  if (!stateless) {
    return entityState;
  }

  if (typeof entityArg === 'function') {
    return (entityArg as EntityGetter<T>)();
  }

  return entityArg;
};
