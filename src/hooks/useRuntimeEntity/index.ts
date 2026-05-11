import { useConstantEntityReducers } from '../useConstantEntityReducers';
import { EntityStore } from '@mic-rexjs/usecases';
import { Statuses } from '@/enums/Statuses';
import { EntityGetter } from '@/hooks/useUseCase/types';
import { Dependencies } from '@/types';
import { valueUseCase } from '@/usecases/valueUseCase';

export const useRuntimeEntity = <T, TDependencies extends Dependencies = Dependencies>(
  store: EntityStore<T>,
  entityArg: T | EntityGetter<T, TDependencies>,
  contextEntity: T,
  statuses: Statuses,
): T => {
  const { isValueChanged, recordValue } = useConstantEntityReducers(
    entityArg,
    valueUseCase<T | EntityGetter<T, TDependencies>>,
  );

  const changed = isValueChanged(entityArg);
  const entityRootDisabled = (statuses & Statuses.EntityRootEnabled) !== Statuses.EntityRootEnabled;

  if (entityRootDisabled) {
    return contextEntity as T;
  }

  const isFunction = typeof entityArg === 'function';
  const { value } = store;

  switch (true) {
    case isFunction:
    case !changed:
      return value;
  }

  recordValue(entityArg);
  return entityArg;
};
