import { useEffect } from 'react';
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
): [entity: T, store: EntityStore<T>] => {
  const update = useUpdate();
  const optionsRef = useLatest(options);
  const contextEntity = (contextStore ? contextStore.value : null) as T;
  const entityEnabled = (statuses & Statuses.EntityEnabled) === Statuses.EntityEnabled;
  const entityRootEnabled = (statuses & Statuses.EntityRootEnabled) === Statuses.EntityRootEnabled;

  const store = useContextualItem(contextStore, statuses, (): EntityStore<T> => {
    if (!entityRootEnabled) {
      return new EntityStore(null as T);
    }

    const isFunction = typeof entityArg === 'function';

    return new EntityStore(isFunction ? (entityArg as EntityGetter<T>)() : entityArg);
  });

  const runtimeEntity = useRuntimeEntity(store, entityArg, contextEntity, statuses);

  const onEntityChange = useMemoizedFn((newEntity: T, oldEntity: T): void => {
    const { onChange, watch } = optionsRef.current;
    const globalEnabled = (statuses & Statuses.GlobalEnabled) === Statuses.GlobalEnabled;

    if (watch) {
      triggerWatchers(watch, newEntity, oldEntity);
    }

    onChange?.(newEntity, oldEntity);

    if (entityRootEnabled || globalEnabled) {
      update();
    }
  });

  if (entityRootEnabled) {
    // 执行同步操作
    store.value = runtimeEntity;
  }

  useEffect((): void | VoidFunction => {
    if (!entityEnabled) {
      return;
    }

    store.watch(onEntityChange);

    return (): void => {
      store.unwatch(onEntityChange);
    };
  }, [entityEnabled, store, onEntityChange]);

  return useCreation((): [entity: T, store: EntityStore<T>] => {
    return [runtimeEntity, store];
  }, [runtimeEntity, store]);
};
