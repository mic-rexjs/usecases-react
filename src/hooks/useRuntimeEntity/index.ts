import { UseCaseStatuses } from '@/enums/UseCaseStatuses';
import { EntityGetter } from '@/hooks/useUseCase/types';
import { EntityStore } from '@mic-rexjs/usecases';
import { useRef } from 'react';

export const useRuntimeEntity = <T>(
  store: EntityStore<T>,
  rootEntity: T | EntityGetter<T>,
  contextEntity: T,
  statuses: UseCaseStatuses,
): T => {
  const prevRootEntityRef = useRef(rootEntity);
  const entityRootDisabled = (statuses & UseCaseStatuses.EntityRootEnabled) !== UseCaseStatuses.EntityRootEnabled;

  if (entityRootDisabled) {
    return contextEntity as T;
  }

  const isFunction = typeof rootEntity === 'function';
  const { current: prevRootEntity } = prevRootEntityRef;

  switch (true) {
    case isFunction:
    case prevRootEntity === rootEntity:
      return store.value;
  }

  prevRootEntityRef.current = rootEntity;
  return rootEntity;
};
