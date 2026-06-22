import { useConstantEntityReducers } from '../useConstantEntityReducers';
import { EntityStore } from '@mic-rexjs/usecases';
import { Statuses } from '@/enums/Statuses';
import { Dependencies, EntityInitializer } from '@/types';
import { valueUseCase } from '@/usecases/valueUseCase';

export const useEntity = <T, TDependencies extends Dependencies = Dependencies>(
  store: EntityStore<T>,
  entityArg: T | EntityInitializer<T, TDependencies>,
  statuses: Statuses,
): T => {
  const { isValueChanged, recordValue } = useConstantEntityReducers(
    entityArg,
    valueUseCase<T | EntityInitializer<T, TDependencies>>,
  );

  const changed = isValueChanged(entityArg);
  const entityRootDisabled = (statuses & Statuses.EntityRootEnabled) !== Statuses.EntityRootEnabled;
  const isFunction = typeof entityArg === 'function';
  const { value } = store;

  switch (true) {
    case entityRootDisabled:
    case isFunction:
    case !changed:
      return value;
  }

  recordValue(entityArg);

  store.disableWatchers();
  // 执行同步操作
  store.setValue(entityArg);
  store.enableWatchers();

  return entityArg;
};
