import { createEntity, createEntityReducers, EntityStore } from '@mic-rexjs/usecases';
import { EntityGeneratorValues } from '@mic-rexjs/usecases/es/types';
import { EntityInitializer, InitEntityResult } from '@/types';
import { entityRuntimeUseCase } from '@/usecases/entityRuntimeUseCase';
import { objectUtilsUseCase } from '@/usecases/objectUtilsUseCase';

export const runEntityInitializer = <T>(
  store: EntityStore<T>,
  initializer: EntityInitializer<T>,
  prevCreateEntityList: Partial<T>[],
  isInitializing: boolean,
): Partial<T>[] => {
  let isAsync = false;
  let index = 0;
  const createEntityList: Partial<T>[] = [];
  const { isObject, isEqual } = objectUtilsUseCase();

  const onInitStoreValue = (value: T): T => {
    if (!isInitializing || isAsync) {
      return value;
    }

    return store.initValue(value);
  };

  const { initEntity } = createEntityReducers(store, entityRuntimeUseCase<T>, {
    onInit(currentValue: T): InitEntityResult<T> {
      return initializer(currentValue);
    },
    onCreate(newEntity: T, oldEntity: T): T {
      const currentIndex = index;
      const isObj = isObject(oldEntity);
      const isArray = isObj && Array.isArray(oldEntity);

      index++;
      createEntityList[currentIndex] = newEntity;

      if (!isObj || isArray) {
        return createEntity(oldEntity, newEntity);
      }

      const descriptors: PropertyDescriptorMap = {};
      const { [currentIndex]: prevEntity } = prevCreateEntityList;

      isEqual(prevEntity, newEntity, (key: keyof T): void => {
        const descriptor = Object.getOwnPropertyDescriptor(newEntity, key) || null;

        if (descriptor === null) {
          return;
        }

        descriptors[key] = descriptor;
      });

      return createEntity(oldEntity, Object.defineProperties({}, descriptors));
    },
    onGenerate(entity: T, result?: T): EntityGeneratorValues<T, T | undefined> {
      if (typeof result === 'undefined') {
        return [entity, result];
      }

      const newResult = createEntity<T>(entity, result);

      // 不能用 `store.value`，因为可能存在异步，异步更新是需要触发组件更新的
      store.setValue(newResult);
      return [newResult, result];
    },
    onYield(entity: T): T {
      return onInitStoreValue(entity);
    },
    onReturn(entity: T): T {
      const newEntity = onInitStoreValue(entity);

      // 不能用 `store.value`，因为可能存在异步，异步更新是需要触发组件更新的
      store.setValue(newEntity);
      return newEntity;
    },
  });

  // 禁用 `store` 的事件，避免触发 `onChange`
  store.disableWatchers();
  initEntity();
  store.enableWatchers();

  isAsync = true;
  return createEntityList;
};
