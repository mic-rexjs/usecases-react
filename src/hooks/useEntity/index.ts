import { useConstant } from '../useConstant';
import { useConstantReducers } from '../useConstantReducers';
import { useEntityInitializing } from '../useEntityInitializing';
import { useExec } from '../useExec';
import { UseCaseHookOptions } from '../useUseCase/types';
import { EntityStore, utilsUseCase } from '@mic-rexjs/usecases';
import { useLatest, useMemoizedFn, useUnmount, useUpdate, useUpdateEffect } from 'ahooks';
import { useEffect, useRef } from 'react';
import { Statuses } from '@/enums/Statuses';
import { triggerWatchers } from '@/methods/triggerWatchers';
import { lifecycleEventUseCase } from '@/usecases/lifecycleEventUseCase';
import { LifecycleEventReducers } from '@/usecases/lifecycleEventUseCase/types';

export const useEntity = <
  T,
  TUseCaseOptions extends object,
  TOptions extends UseCaseHookOptions<T, TUseCaseOptions> = UseCaseHookOptions<T, TUseCaseOptions>,
>(
  store: EntityStore<T>,
  statuses: Statuses,
  options: TOptions,
): T => {
  const { value: entity } = store;
  const update = useUpdate();
  const isInitializing = useEntityInitializing(statuses);
  const optionsRef = useLatest(options);
  const prevEntityRef = useRef(entity);
  const entityEnabled = (statuses & Statuses.EntityEnabled) === Statuses.EntityEnabled;
  const entityRootEnabled = (statuses & Statuses.EntityRootEnabled) === Statuses.EntityRootEnabled;

  const { bindLifecycleEventsKey, getLifecycleEvents, deleteLifecycleEvents } = useConstantReducers(
    (): LifecycleEventReducers => {
      return lifecycleEventUseCase();
    },
  );

  const lifecycleKey = useConstant((): React.Key => {
    const { createKey } = utilsUseCase();

    return createKey();
  });

  const onTriggerWatchers = useMemoizedFn((newEntity: T, oldEntity: T): void => {
    const { watch } = optionsRef.current;

    if (!watch) {
      return;
    }

    triggerWatchers(watch, newEntity, oldEntity);
  });

  const onEntityUpdate = useMemoizedFn((newEntity = entity, oldEntity = prevEntityRef.current): void => {
    if (!entityEnabled) {
      return;
    }

    const { current: prevEntity } = prevEntityRef;

    if (prevEntity === newEntity) {
      return;
    }

    const { onUpdate, onAdopt, onDiscard } = getLifecycleEvents(lifecycleKey);

    prevEntityRef.current = newEntity;
    onTriggerWatchers(newEntity, oldEntity as T);
    onDiscard?.(oldEntity);
    onAdopt?.(newEntity, oldEntity);
    onUpdate?.(newEntity, oldEntity);
  });

  const onEntityChange = useMemoizedFn((newEntity: T, oldEntity: T): void => {
    const { current: currentOptions } = optionsRef;
    const { onChange: onChange1 } = currentOptions;
    const { onChange: onChange2 } = getLifecycleEvents(lifecycleKey);

    onEntityUpdate(newEntity, oldEntity);
    onChange1?.(newEntity, oldEntity);
    onChange2?.(newEntity, oldEntity);

    if (!entityRootEnabled) {
      return;
    }

    update();
  });

  useExec((): void => {
    if (!entityRootEnabled) {
      return;
    }

    const { onBind, onAdopt } = bindLifecycleEventsKey(lifecycleKey);

    if (!isInitializing) {
      return;
    }

    onBind?.(entity);
    onAdopt?.(entity);
  });

  useUnmount((): void => {
    if (!entityRootEnabled) {
      return;
    }

    // 要使用最新的 `entity`
    const { value: currentEntity } = store;
    const { onUnbind, onDiscard } = getLifecycleEvents(lifecycleKey);

    deleteLifecycleEvents(lifecycleKey);
    onUnbind?.(currentEntity);
    onDiscard?.(currentEntity);
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
  }, [store, entityEnabled, onEntityChange]);

  /**
   * 在变化时候，组件更新前，使用 `unwatch`
   */
  useEffect((): VoidFunction => {
    return (): void => {
      store.unwatch(onEntityChange);
    };
  }, [store, entityEnabled, onEntityChange]);

  useUpdateEffect((): void => {
    onEntityUpdate();
  }, [entity, onEntityUpdate]);

  return entity;
};
