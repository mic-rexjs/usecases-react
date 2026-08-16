import { useContextualItem } from '../useContextualItem';
import { UseCaseHookOptions } from '../useUseCase/types';
import { createEntity, createEntityReducers, EntityReducers, EntityStore } from '@mic-rexjs/usecases';
import { EntityGeneratorValues } from '@mic-rexjs/usecases/es/types';
import { useContext, useRef } from 'react';
import { Statuses } from '@/enums/Statuses';
import { Dependencies, EntityInitializer, InitEntityResult } from '@/types';
import { EntityUseCaseContextValue, UseCaseContext } from '@/usecases/contextUseCase/types';
import { entityRuntimeUseCase } from '@/usecases/entityRuntimeUseCase';
import { valueUseCase } from '@/usecases/valueUseCase';

export const useStore = <
  T,
  TUseCaseOptions extends object,
  TOptions extends UseCaseHookOptions<T, TUseCaseOptions> = UseCaseHookOptions<T, TUseCaseOptions>,
>(
  entityArg: T | EntityInitializer<T>,
  context: UseCaseContext<EntityUseCaseContextValue<T, EntityReducers<T>>>,
  statuses: Statuses,
  options: TOptions,
  deps: Dependencies = [],
): EntityStore<T> => {
  const storeRef = useRef<EntityStore<T>>(null);
  const createEntityListRef = useRef<Partial<T>[]>([]);
  const entityRootEnabled = (statuses & Statuses.EntityRootEnabled) === Statuses.EntityRootEnabled;
  const contextValue = useContext(context);
  const { store: contextStore = null } = contextValue || {};

  const initStore = (): EntityStore<T> => {
    const isFunction = typeof entityArg === 'function';

    if (!isFunction) {
      return new EntityStore(entityArg);
    }

    let index = 0;
    const { current: currentStore } = storeRef;
    const { value: currentEntity } = currentStore || {};
    const { current: prevCreateEntityList } = createEntityListRef;
    const store = new EntityStore(currentEntity as T);
    const createEntityList: Partial<T>[] = [];
    const { isObjectValue, matchValue } = valueUseCase();

    const { initEntity } = createEntityReducers(store, entityRuntimeUseCase<T>, {
      onInit(currentValue: T): InitEntityResult<T> {
        return (entityArg as EntityInitializer<T>)(currentValue);
      },
      onCreate(newEntity: T, oldEntity: T): T {
        const currentIndex = index;
        const isObject = isObjectValue(oldEntity);
        const isArray = isObject && Array.isArray(oldEntity);

        index++;
        createEntityList[currentIndex] = newEntity;

        if (!isObject || isArray) {
          return createEntity(oldEntity, newEntity);
        }

        const descriptors: PropertyDescriptorMap = {};
        const { [currentIndex]: prevEntity } = prevCreateEntityList;

        matchValue(prevEntity, newEntity, (key: keyof T): void => {
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
      onReturn(result: T): T {
        // 不能用 `store.value`，因为可能存在异步，异步更新是需要触发组件更新的
        store.setValue(result);
        return result;
      },
    });

    initEntity();

    storeRef.current = store;
    createEntityListRef.current = createEntityList;
    return store;
  };

  return useContextualItem(
    contextStore,
    statuses,
    (): EntityStore<T> => {
      if (!entityRootEnabled) {
        return new EntityStore<T>(null as T);
      }

      return initStore();
    },
    deps,
  );
};
