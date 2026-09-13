import { useEntityInitializing } from '../useEntityInitializing';
import { useExec } from '../useExec';
import { UseCaseHookOptions } from '../useUseCase/types';
import { EntityStore } from '@mic-rexjs/usecases';
import { ScopedEntityReducers } from '@mic-rexjs/usecases/es/methods/createEntityReducers/types';
import { EntityReducerMap } from '@mic-rexjs/usecases/es/types';
import { useLatest, useMemoizedFn, usePrevious, useUnmount, useUpdate, useUpdateEffect } from 'ahooks';
import { useEffect, useRef } from 'react';
import { Statuses } from '@/enums/Statuses';
import { triggerWatchers } from '@/methods/triggerWatchers';
import { EntityInitializer } from '@/types';

export const useEntity = <
  T,
  TUseCaseOptions extends object,
  TOptions extends UseCaseHookOptions<T, TUseCaseOptions> = UseCaseHookOptions<T, TUseCaseOptions>,
>(
  entityArg: T | EntityInitializer<T>,
  store: EntityStore<T>,
  reducers: ScopedEntityReducers<T, EntityReducerMap<T>>,
  statuses: Statuses,
  options: TOptions,
): T => {
  const update = useUpdate();
  const isFunction = typeof entityArg === 'function';
  const { value: entity } = store;
  const optionsRef = useLatest(options);
  const prevEntityRef = useRef(entity);
  const isInitializing = useEntityInitializing(statuses);
  const entityEnabled = (statuses & Statuses.EntityEnabled) === Statuses.EntityEnabled;
  const entityRootEnabled = (statuses & Statuses.EntityRootEnabled) === Statuses.EntityRootEnabled;
  const { bindEntity, unbindEntity } = reducers;

  const prevEntityArg = usePrevious(entityArg, (): boolean => {
    return true;
  });

  const onTriggerWatchers = useMemoizedFn((newEntity: T, oldEntity: T): void => {
    const { watch } = optionsRef.current;

    if (!watch) {
      return;
    }

    triggerWatchers(watch, newEntity, oldEntity);
  });

  const onValueChange = useMemoizedFn((newEntity = entity, oldEntity = prevEntityRef.current): void => {
    if (!entityEnabled) {
      return;
    }

    prevEntityRef.current = newEntity;
    onTriggerWatchers(newEntity, oldEntity as T);
  });

  const onEntityChange = useMemoizedFn((newEntity: T, oldEntity: T): void => {
    const { onChange } = optionsRef.current;

    onValueChange(newEntity, oldEntity);
    onChange?.(newEntity, oldEntity);

    if (!entityRootEnabled) {
      return;
    }

    update();
  });

  useExec((): void => {
    if (!entityRootEnabled) {
      return;
    }

    if (isInitializing) {
      // 这里不要修改 `entity`，因为 `useUseCase` 有初始化 `entity` 的逻辑
      bindEntity?.();
    }

    if (isFunction) {
      return;
    }

    const isChanged = entityArg !== prevEntityArg;

    if (!isChanged || isInitializing) {
      return;
    }

    store.disableWatchers();
    // 执行同步操作
    store.setValue(entityArg);
    store.enableWatchers();
  });

  /**
   * 需要马上 `watch`，因为 `useEffect` 在子组件内优先执行，
   * 如果使用了 `setEntity` 则无法监控到变化
   */
  useExec((): void => {
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

  useUnmount((): void => {
    if (!entityRootEnabled) {
      return;
    }

    unbindEntity?.();
  });

  useUpdateEffect((): void => {
    onValueChange();
  }, [entity, onValueChange]);

  return store.value;
};
