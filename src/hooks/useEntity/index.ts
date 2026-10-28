import { useConstant } from '../useConstant';
import { useEntityReturn } from '../useEntityReturn';
import { useEntityRootExec } from '../useEntityRootExec';
import { ContextualUseCaseHookOptions } from '../useUseCase/types';
import { EntityStore, utilsUseCase } from '@mic-rexjs/usecases';
import { useLatest, useMemoizedFn, useUpdate, useUpdateEffect } from 'ahooks';
import { useRef } from 'react';
import { Statuses } from '@/enums/Statuses';
import { triggerWatchers } from '@/methods/triggerWatchers';
import { lifecycleEventUseCase } from '@/usecases/lifecycleEventUseCase';

export const useEntity = <T>(
  store: EntityStore<T>,
  statuses: Statuses,
  options: ContextualUseCaseHookOptions<T>,
): T => {
  const { value: entity } = store;
  const update = useUpdate();
  const optionsRef = useLatest(options);
  const prevEntityRef = useRef(entity);
  const hasEntity = (statuses & Statuses.Entity) === Statuses.Entity;
  const { bindLifecycleEventsKey, getLifecycleEvents, deleteLifecycleEvents } = useConstant(lifecycleEventUseCase);

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
    const { current: prevEntity } = prevEntityRef;

    if (!hasEntity) {
      return;
    }

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

  const onEntityLifecycleChange = useMemoizedFn((newEntity: T, oldEntity: T): void => {
    const { onChange } = getLifecycleEvents(lifecycleKey);

    onChange?.(newEntity, oldEntity);
    update();
  });

  const onEntityOptionsChange = useMemoizedFn((newEntity: T, oldEntity: T): void => {
    const { current: currentOptions } = optionsRef;
    const { onChange } = currentOptions;

    onChange?.(newEntity, oldEntity);
  });

  useEntityRootExec(
    statuses,
    (): void => {
      const { onBind, onAdopt } = bindLifecycleEventsKey(lifecycleKey);

      store.watch(onEntityLifecycleChange);
      onBind?.(entity);
      onAdopt?.(entity);
    },
    (): void => {
      // 要使用最新的 `entity`
      const { value: currentEntity } = store;
      const { onUnbind, onDiscard } = getLifecycleEvents(lifecycleKey);

      store.unwatch(onEntityLifecycleChange);
      deleteLifecycleEvents(lifecycleKey);

      onUnbind?.(currentEntity);
      onDiscard?.(currentEntity);
    },
  );

  /**
   * 需要马上 `watch`，因为 `useEffect` 在子组件内优先执行，
   * 如果使用了 `setEntity` 则无法监控到变化
   */
  useEntityReturn(
    statuses,
    (): void => {
      store.watch(onEntityOptionsChange);
      store.watch(onEntityUpdate);
    },
    /**
     * 在变化时候，组件更新前，使用 `unwatch`
     */
    (): void => {
      store.unwatch(onEntityOptionsChange);
      store.unwatch(onEntityUpdate);
    },
    [store],
  );

  useUpdateEffect((): void => {
    onEntityUpdate();
  }, [entity, onEntityUpdate]);

  return entity;
};
