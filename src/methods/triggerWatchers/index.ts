import { EntityWatcher, EntityWatchMap } from '../../hooks/useUseCase/types';
import { MatchPropertyFailedResult } from '@/entities/matchPropertyFailedResult/types';
import { objectUtilsUseCase } from '@/usecases/objectUtilsUseCase';

export const triggerWatchers = <T>(watch: EntityWatchMap<T>, newEntity: T, oldEntity: T): void => {
  const { matchProperty } = objectUtilsUseCase();

  for (const [fieldPath, watcher] of Object.entries(watch)) {
    matchProperty(oldEntity, newEntity, fieldPath, (result: MatchPropertyFailedResult<T>): void => {
      (watcher as EntityWatcher<T>)(result);
    });
  }
};
