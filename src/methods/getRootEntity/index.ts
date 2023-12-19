import { UseCaseModes } from '@/enums/UseCaseModes';
import { EntityGetter } from '@/hooks/useUseCase/types';

export const getRootEntity = <T>(entityState: T, unsafeEntity: T | EntityGetter<T>, mode: UseCaseModes): T => {
  if ((mode & UseCaseModes.Stateless) !== UseCaseModes.Stateless) {
    return entityState;
  }

  if (typeof unsafeEntity === 'function') {
    return (unsafeEntity as EntityGetter<T>)();
  }

  return unsafeEntity;
};
