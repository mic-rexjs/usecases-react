import { createEntityReducers, EntityStore } from '@mic-rexjs/usecases';
import { Dependencies, EntityInitializer, InitEntityResult } from '@/types';
import { entityRuntimeUseCase } from '@/usecases/entityRuntimeUseCase';

export const initStore = <T, TDependencies extends Dependencies = Dependencies>(
  entity: T | EntityInitializer<T>,
  prevStore: EntityStore<T> | null,
  changedDeps: Partial<TDependencies>,
): EntityStore<T> => {
  const isFunction = typeof entity === 'function';

  if (!isFunction) {
    return new EntityStore(entity);
  }

  const { value } = prevStore || {};
  const store = new EntityStore(value as T);

  const { initEntity } = createEntityReducers(store, entityRuntimeUseCase<T>, {
    onInit(currentValue: T): InitEntityResult<T> {
      return (entity as EntityInitializer<T, Dependencies>)(currentValue, changedDeps);
    },
    onReturn(result: T): T {
      store.setValue(result);
      return result;
    },
  });

  initEntity();
  return store;
};
