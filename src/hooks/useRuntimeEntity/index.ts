import { Statuses } from '@/enums/Statuses';
import { EntityGetter } from '@/hooks/useUseCase/types';
import { EntityStore } from '@mic-rexjs/usecases';
import { useRef } from 'react';

export const useRuntimeEntity = <T>(
  store: EntityStore<T>,
  entityArg: T | EntityGetter<T>,
  contextEntity: T,
  statuses: Statuses,
): T => {
  const prevEntityArgRef = useRef(entityArg);
  const entityRootDisabled = (statuses & Statuses.EntityRootEnabled) !== Statuses.EntityRootEnabled;

  if (entityRootDisabled) {
    return contextEntity as T;
  }

  const isFunction = typeof entityArg === 'function';
  const { current: prevEntityArg } = prevEntityArgRef;

  switch (true) {
    case isFunction:
    case prevEntityArg === entityArg:
      return store.value;
  }

  prevEntityArgRef.current = entityArg;
  return entityArg;
};
