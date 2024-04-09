import { useEffect, useState } from 'react';
import { EntityStore } from '@mic-rexjs/usecases';
import { UseCaseStatuses } from '@/enums/UseCaseStatuses';
import { getRenderingEntity } from '@/methods/getRenderingEntity';
import { EntityGetter, UseCaseHookOptions } from '../useUseCase/types';
import { useContextualItem } from '../useContextualItem';
import { useCreation, useMemoizedFn } from 'ahooks';
import { triggerWatchers } from '@/methods/triggerWatchers';

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
  const [entityState, setEntityState] = useState(rootEntity);
  const contextEntity = (contextStore ? contextStore.value : null) as T;
  const renderingEntity = getRenderingEntity(statuses, entityState, rootEntity, contextEntity);
  const entityEnabled = (statuses & UseCaseStatuses.EntityEnabled) === UseCaseStatuses.EntityEnabled;
  const entityRootEnabled = (statuses & UseCaseStatuses.EntityRootEnabled) === UseCaseStatuses.EntityRootEnabled;

  const store = useContextualItem(contextStore, statuses, (): EntityStore<T> => {
    if (!entityRootEnabled) {
      return new EntityStore(null as T);
    }

    const stateless = (statuses & UseCaseStatuses.StatelessEnabled) === UseCaseStatuses.StatelessEnabled;

    return new EntityStore(renderingEntity, {
      onChange(newEntity: T): void {
        if (stateless) {
          return;
        }

        setEntityState(newEntity);
      },
    });
  });

  const rewatch = useMemoizedFn((): VoidFunction => {
    const { onChange, watch } = options;

    const onEntityChange = (newEntity: T, oldEntity: T): void => {
      if (watch) {
        triggerWatchers(watch, newEntity, oldEntity);
      }

      onChange?.(newEntity, oldEntity);
    };

    store.watch(onEntityChange);

    return (): void => {
      store.unwatch(onEntityChange);
    };
  });

  if (entityRootEnabled) {
    // 执行同步操作
    store.value = renderingEntity;
  }

  useEffect((): void | VoidFunction => {
    if (!entityEnabled) {
      return;
    }

    return rewatch();
  }, [entityEnabled, store, depsKey, rewatch]);

  return useCreation((): [entity: T, store: EntityStore<T>] => {
    return [renderingEntity, store];
  }, [renderingEntity, store]);
};
