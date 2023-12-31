import { useEffect, useState } from 'react';
import { EntityStore } from '@mic-rexjs/usecases';
import { UseCaseStatuses } from '@/enums/UseCaseStatuses';
import { getRenderingEntity } from '@/methods/getRenderingEntity';
import { EntityGetter, UseCaseHookOptions } from '../useUseCase/types';
import { useContextualItem } from '../useContextualItem';
import { useCreation, useLatest } from 'ahooks';
import { triggerWatchers } from '@/methods/triggerWatchers';

export const useEntity = <
  T,
  TUseCaseOptions extends object,
  TOptions extends UseCaseHookOptions<T, TUseCaseOptions> = UseCaseHookOptions<T, TUseCaseOptions>
>(
  statuses: UseCaseStatuses,
  rootEntity: T | EntityGetter<T>,
  contextStore: EntityStore<T> | null,
  options: TOptions
): [entity: T, store: EntityStore<T>] => {
  const [entityState, setEntityState] = useState(rootEntity);
  const contextEntity = (contextStore?.getValue() || null) as T;
  const renderingEntity = getRenderingEntity(statuses, entityState, rootEntity, contextEntity);
  const optionsRef = useLatest(options);
  const entityRootEnabled = (statuses & UseCaseStatuses.EntityRootEnabled) === UseCaseStatuses.EntityRootEnabled;

  const store = useContextualItem(statuses, contextStore, (): EntityStore<T> => {
    if (!entityRootEnabled) {
      return new EntityStore(null as T);
    }

    const stateless = (statuses & UseCaseStatuses.StatelessEnabled) === UseCaseStatuses.StatelessEnabled;

    return new EntityStore(renderingEntity, (newEntity: T): void => {
      if (stateless) {
        return;
      }

      setEntityState(newEntity);
    });
  });

  if (entityRootEnabled) {
    // 执行同步操作
    store.setValue(renderingEntity);
  }

  useEffect((): void | VoidFunction => {
    if ((statuses & UseCaseStatuses.EntityEnabled) !== UseCaseStatuses.EntityEnabled) {
      return;
    }

    const watcher = (newEntity: T, oldEntity: T): void => {
      const { onChange, watch } = optionsRef.current;

      if (watch) {
        triggerWatchers(watch, newEntity, oldEntity);
      }

      onChange?.(newEntity, oldEntity);
    };

    store.watch(watcher);

    return (): void => {
      store.unwatch(watcher);
    };
  }, [statuses, store, optionsRef]);

  return useCreation((): [entity: T, store: EntityStore<T>] => {
    return [renderingEntity, store];
  }, [renderingEntity, store]);
};
