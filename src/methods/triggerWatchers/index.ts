import { EntityWatchMap, EntityWatcher } from '../../hooks/useUseCase/types';
import { compareProperty } from '../compareProperty';

export const triggerWatchers = <T>(watch: EntityWatchMap<T>, newEntity: T, oldEntity: T): void => {
  for (const [fieldPath, watcher] of Object.entries(watch)) {
    compareProperty(
      oldEntity,
      newEntity,
      fieldPath,
      <TOldValue, TNewValue>(oldValue: TOldValue, newValue: TNewValue, fieldPaths: string[]): void => {
        (watcher as EntityWatcher<T>)({
          fieldPaths,
          newEntity,
          oldEntity,
          newValue,
          oldValue,
        });
      }
    );
  }
};
