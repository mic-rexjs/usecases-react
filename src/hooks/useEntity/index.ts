import { useEffect } from 'react';
import { EntityStore } from '@mic-rexjs/usecases';
import { UseCaseStatuses } from '@/enums/UseCaseStatuses';
import { EntityGetter, UseCaseHookOptions } from '../useUseCase/types';
import { useContextualItem } from '../useContextualItem';
import { useCreation, useLatest, useUpdate } from 'ahooks';
import { triggerWatchers } from '@/methods/triggerWatchers';
import { useRuntimeEntity } from '../useRuntimeEntity';

export const useEntity = <
  T,
  TUseCaseOptions extends object,
  TOptions extends UseCaseHookOptions<T, TUseCaseOptions> = UseCaseHookOptions<T, TUseCaseOptions>,
>(
  statuses: UseCaseStatuses,
  rootEntity: T | EntityGetter<T>,
  contextStore: EntityStore<T> | null,
  options: TOptions,
  depsKey: number,
): [entity: T, store: EntityStore<T>] => {
  const update = useUpdate();
  const optionsRef = useLatest(options);
  const contextEntity = (contextStore ? contextStore.value : null) as T;
  const entityEnabled = (statuses & UseCaseStatuses.EntityEnabled) === UseCaseStatuses.EntityEnabled;
  const entityRootEnabled = (statuses & UseCaseStatuses.EntityRootEnabled) === UseCaseStatuses.EntityRootEnabled;

  const store = useContextualItem(contextStore, statuses, (): EntityStore<T> => {
    if (!entityRootEnabled) {
      return new EntityStore(null as T);
    }

    const isFunction = typeof rootEntity === 'function';

    return new EntityStore(isFunction ? (rootEntity as EntityGetter<T>)() : rootEntity, {
      onChange(): void {
        update();
      },
    });
  });

  const runtimeEntity = useRuntimeEntity(store, rootEntity, contextEntity, statuses);

  if (entityRootEnabled) {
    // 执行同步操作
    store.value = runtimeEntity;
  }

  useEffect((): void | VoidFunction => {
    if (!entityEnabled) {
      return;
    }

    const onEntityChange = (newEntity: T, oldEntity: T): void => {
      const { onChange, watch } = optionsRef.current;

      if (watch) {
        triggerWatchers(watch, newEntity, oldEntity);
      }

      onChange?.(newEntity, oldEntity);
    };

    store.watch(onEntityChange);

    return (): void => {
      store.unwatch(onEntityChange);
    };
  }, [entityEnabled, store, depsKey, optionsRef]);

  return useCreation((): [entity: T, store: EntityStore<T>] => {
    return [runtimeEntity, store];
  }, [runtimeEntity, store]);
};
