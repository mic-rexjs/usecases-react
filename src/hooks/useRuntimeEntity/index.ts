import { useEntityReducers } from '../useEntityReducers';
import { EntityStore } from '@mic-rexjs/usecases';
import { Statuses } from '@/enums/Statuses';
import { EntityGetter } from '@/hooks/useUseCase/types';
import { valueUseCase } from '@/usecases/valueUseCase';

export const useRuntimeEntity = <T>(
  store: EntityStore<T>,
  entityArg: T | EntityGetter<T>,
  contextEntity: T,
  statuses: Statuses,
): T => {
  const { isValueChanged, recordValue } = useEntityReducers(entityArg, valueUseCase<T | EntityGetter<T>>);
  const changed = isValueChanged(entityArg);
  const entityRootDisabled = (statuses & Statuses.EntityRootEnabled) !== Statuses.EntityRootEnabled;

  if (entityRootDisabled) {
    return contextEntity as T;
  }

  const isFunction = typeof entityArg === 'function';

  switch (true) {
    case isFunction:
    case !changed:
      return store.value;
  }

  recordValue(entityArg);
  return entityArg;
};
