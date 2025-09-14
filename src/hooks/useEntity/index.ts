import { useEffect, useRef } from 'react';
import { EntityStore } from '@mic-rexjs/usecases';
import { Statuses } from '@/enums/Statuses';
import { EntityGetter, UseCaseHookOptions } from '../useUseCase/types';
import { useContextualItem } from '../useContextualItem';
import { useCreation, useLatest, useMemoizedFn, useUpdate } from 'ahooks';
import { triggerWatchers } from '@/methods/triggerWatchers';
import { useRuntimeEntity } from '../useRuntimeEntity';

export const useEntity = <
  T,
  TUseCaseOptions extends object,
  TOptions extends UseCaseHookOptions<T, TUseCaseOptions> = UseCaseHookOptions<T, TUseCaseOptions>,
>(
  statuses: Statuses,
  entityArg: T | EntityGetter<T>,
  contextStore: EntityStore<T> | null,
  options: TOptions,
  depsKey: number,
): [entity: T, store: EntityStore<T>] => {
  const update = useUpdate();
  const storeRef = useRef<EntityStore<T>>();
  const optionsRef = useLatest(options);
  const contextEntity = (contextStore ? contextStore.value : null) as T;
  const entityEnabled = (statuses & Statuses.EntityEnabled) === Statuses.EntityEnabled;
  const entityRootEnabled = (statuses & Statuses.EntityRootEnabled) === Statuses.EntityRootEnabled;

  const store = useContextualItem(
    contextStore,
    statuses,
    (): EntityStore<T> => {
      let newStore: EntityStore<T>;

      if (entityRootEnabled) {
        const isFunction = typeof entityArg === 'function';
        const initailEntity = isFunction ? (entityArg as EntityGetter<T>)(storeRef.current?.value) : entityArg;

        newStore = new EntityStore(initailEntity);
      } else {
        newStore = new EntityStore(null as T);
      }

      storeRef.current = newStore;
      return newStore;
    },
    depsKey,
  );

  const runtimeEntity = useRuntimeEntity(store, entityArg, contextEntity, statuses);

  const onEntityChange = useMemoizedFn((newEntity: T, oldEntity: T): void => {
    const { onChange, watch } = optionsRef.current;

    if (watch) {
      triggerWatchers(watch, newEntity, oldEntity);
    }

    onChange?.(newEntity, oldEntity);

    if (!entityRootEnabled) {
      return;
    }

    update();
  });

  if (entityRootEnabled) {
    // 执行同步操作
    store.value = runtimeEntity;
  }

  /**
   * 需要马上 `watch`，因为 `useEffect` 在子组件内优先执行，
   * 如果使用了 `setEntity` 则无法监控到变化
   */
  useCreation((): void => {
    if (!entityEnabled) {
      return;
    }

    store.watch(onEntityChange);
  }, [entityEnabled, store, onEntityChange]);

  /**
   * 在变化时候，组件更新前，使用 `unwatch`
   */
  useEffect((): VoidFunction => {
    return (): void => {
      store.unwatch(onEntityChange);
    };
  }, [entityEnabled, store, onEntityChange]);

  return useCreation((): [entity: T, store: EntityStore<T>] => {
    return [runtimeEntity, store];
  }, [runtimeEntity, store]);
};
