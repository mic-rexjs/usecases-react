import { UseCaseStatuses } from '@/enums/UseCaseStatuses';
import { EntityGetter } from '@/hooks/useUseCase/types';

export const getRenderingEntity = <T>(
  statuses: UseCaseStatuses,
  entityState: T,
  rootEntity: T | EntityGetter<T>,
  contextEntity: T,
): T => {
  if ((statuses & UseCaseStatuses.EntityRootEnabled) !== UseCaseStatuses.EntityRootEnabled) {
    return contextEntity as T;
  }

  if ((statuses & UseCaseStatuses.StatelessEnabled) !== UseCaseStatuses.StatelessEnabled) {
    return entityState;
  }

  if (typeof rootEntity === 'function') {
    return (rootEntity as EntityGetter<T>)();
  }

  return rootEntity;
};
