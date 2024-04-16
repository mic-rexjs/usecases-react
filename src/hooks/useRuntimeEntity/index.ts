import { UseCaseStatuses } from '@/enums/UseCaseStatuses';
import { EntityGetter } from '@/hooks/useUseCase/types';
import { useRef } from 'react';

export const useRuntimeEntity = <T>(
  statuses: UseCaseStatuses,
  entityState: T,
  rootEntity: T | EntityGetter<T>,
  contextEntity: T,
): T => {
  const prevRootEntityRef = useRef(rootEntity);
  const entityRootDisabled = (statuses & UseCaseStatuses.EntityRootEnabled) !== UseCaseStatuses.EntityRootEnabled;

  if (entityRootDisabled) {
    return contextEntity as T;
  }

  const isFunction = typeof rootEntity === 'function';
  const statelessEnable = (statuses & UseCaseStatuses.StatelessEnabled) === UseCaseStatuses.StatelessEnabled;

  if (statelessEnable) {
    if (isFunction) {
      return (rootEntity as EntityGetter<T>)();
    }

    return rootEntity;
  }

  const { current: prevRootEntity } = prevRootEntityRef;

  const stateControllableDisabled =
    (statuses & UseCaseStatuses.StateControllableEnabled) !== UseCaseStatuses.StateControllableEnabled;

  switch (true) {
    case stateControllableDisabled:
    case isFunction:
    case prevRootEntity === rootEntity:
      return entityState;
  }

  prevRootEntityRef.current = rootEntity;
  return rootEntity;
};
