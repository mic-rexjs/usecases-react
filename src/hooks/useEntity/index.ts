import { useConstantEntityReducers } from '../useConstantEntityReducers';
import { useExec } from '../useExec';
import { UseCaseHookOptions } from '../useUseCase/types';
import { EntityStore } from '@mic-rexjs/usecases';
import { ScopedEntityReducers } from '@mic-rexjs/usecases/es/methods/createEntityReducers/types';
import { EntityReducerMap } from '@mic-rexjs/usecases/es/types';
import { useLatest, useMemoizedFn, useUnmount, useUpdate, useUpdateEffect } from 'ahooks';
import { useEffect, useRef } from 'react';
import { Statuses } from '@/enums/Statuses';
import { triggerWatchers } from '@/methods/triggerWatchers';
import { Dependencies, EntityInitializer } from '@/types';
import { valueUseCase } from '@/usecases/valueUseCase';

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
  const isFirstRef = useRef(true);
  const optionsRef = useLatest(options);
  const prevEntityRef = useRef(entity);
  const entityEnabled = (statuses & Statuses.EntityEnabled) === Statuses.EntityEnabled;
  const entityRootEnabled = (statuses & Statuses.EntityRootEnabled) === Statuses.EntityRootEnabled;
  const { bindEntity, unbindEntity } = reducers;

  const { isValueChanged, recordValue } = useConstantEntityReducers(
    entityArg,
    valueUseCase<T | EntityInitializer<T, Dependencies>>,
  );

  const onTriggerWatchers = useMemoizedFn((newEntity: T, oldEntity: T): void => {
    const { watch } = optionsRef.current;

    if (!watch) {
      return;
    }

    triggerWatchers(watch, newEntity, oldEntity);
  });

  const onEntityChange = useMemoizedFn((newEntity: T, oldEntity: T): void => {
    const { onChange } = optionsRef.current;

    prevEntityRef.current = newEntity;

    onTriggerWatchers(newEntity, oldEntity);
    onChange?.(newEntity, oldEntity);

    if (!entityRootEnabled) {
      return;
    }

    update();
  });

  const onValueChange = useMemoizedFn((): void => {
    if (!entityEnabled) {
      return;
    }

    const { current: prevEntity } = prevEntityRef;

    if (entity === prevEntity) {
      return;
    }

    prevEntityRef.current = entity;
    onTriggerWatchers(entity, prevEntity as T);
  });

  useExec((): void => {
    let currentEntity = entityArg as T;
    const { current: isFirst } = isFirstRef;

    isFirstRef.current = false;

    if (isFirst) {
      currentEntity = (bindEntity?.() ?? currentEntity) as T;
    }

    switch (true) {
      case !entityRootEnabled:
      case isFunction:
      case !isValueChanged(currentEntity):
        return;
    }

    recordValue(currentEntity);

    store.disableWatchers();
    // 执行同步操作
    store.setValue(currentEntity);
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
    unbindEntity?.();
  });

  useUpdateEffect((): void => {
    onValueChange();
  }, [entity, onValueChange]);

  return store.value;
};
