import { useConstantEntityReducers } from '../useConstantEntityReducers';
import { useContextualItem } from '../useContextualItem';
import { UseCaseHookOptions } from '../useUseCase/types';
import { EntityReducers, EntityStore } from '@mic-rexjs/usecases';
import { useCreation, useLatest, useMemoizedFn, useUpdate, useUpdateEffect } from 'ahooks';
import { useContext, useEffect, useRef } from 'react';
import { Statuses } from '@/enums/Statuses';
import { initStore } from '@/methods/initStore';
import { triggerWatchers } from '@/methods/triggerWatchers';
import { Dependencies, EntityInitializer } from '@/types';
import { EntityUseCaseContextValue, UseCaseContext } from '@/usecases/contextUseCase/types';
import { valueUseCase } from '@/usecases/valueUseCase';

export const useStore = <
  T,
  TUseCaseOptions extends object,
  TOptions extends UseCaseHookOptions<T, TUseCaseOptions> = UseCaseHookOptions<T, TUseCaseOptions>,
>(
  context: UseCaseContext<EntityUseCaseContextValue<T, EntityReducers<T>>>,
  entity: T | EntityInitializer<T>,
  statuses: Statuses,
  options: TOptions,
  deps: Dependencies = [],
): EntityStore<T> => {
  const update = useUpdate();
  const optionsRef = useLatest(options);
  const storeRef = useRef<EntityStore<T>>(null);
  const entityEnabled = (statuses & Statuses.EntityEnabled) === Statuses.EntityEnabled;
  const entityRootEnabled = (statuses & Statuses.EntityRootEnabled) === Statuses.EntityRootEnabled;
  const contextValue = useContext(context);
  const { store: contextStore = null } = contextValue || {};
  const { recordValueDiff } = useConstantEntityReducers([], valueUseCase<Dependencies>);

  const store = useContextualItem(
    contextStore,
    statuses,
    (): EntityStore<T> => {
      if (!entityRootEnabled) {
        return new EntityStore<T>(null as T);
      }

      const { current } = storeRef;
      const [, changedDeps] = recordValueDiff(deps);
      const newStore = initStore(entity, current, changedDeps);

      storeRef.current = newStore;
      return newStore;
    },
    deps,
  );

  const { value } = store;
  const prevValueRef = useRef(value);

  const onTriggerWatchers = useMemoizedFn((newEntity: T, oldEntity: T): void => {
    const { watch } = optionsRef.current;

    if (!watch) {
      return;
    }

    triggerWatchers(watch, newEntity, oldEntity);
  });

  const onEntityChange = useMemoizedFn((newEntity: T, oldEntity: T): void => {
    const { onChange } = optionsRef.current;

    prevValueRef.current = newEntity;

    onTriggerWatchers(newEntity, oldEntity);
    onChange?.(newEntity, oldEntity);

    if (!entityRootEnabled) {
      return;
    }

    update();
  });

  const onValueChange = useMemoizedFn((): void => {
    if (!entityRootEnabled) {
      return;
    }

    const { current: prevValue } = prevValueRef;

    if (value === prevValue) {
      return;
    }

    prevValueRef.current = value;
    onTriggerWatchers(value, prevValue as T);
  });

  useUpdateEffect((): void => {
    onValueChange();
  }, [value, onValueChange]);

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

  return store;
};
