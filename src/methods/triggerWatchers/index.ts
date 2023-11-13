import { EntityWatchMap, EntityWatcher } from '../../hooks/useUseCase/types';

export const triggerWatchers = <T>(watch: EntityWatchMap<T>, newEntity: T, prevEntity: T): void => {
  for (const [property, watcher] of Object.entries(watch)) {
    const newValue = newEntity?.[property as keyof T];
    const prevValue = prevEntity?.[property as keyof T];

    if (newValue === prevValue) {
      continue;
    }

    (watcher as EntityWatcher<T>)(newEntity, prevEntity);
  }
};
