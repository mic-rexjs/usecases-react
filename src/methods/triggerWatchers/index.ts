import { EntityWatcher, EntityWatchMap } from '../../hooks/useUseCase/types';
import { MatchPropertyFailedResult } from '@/entities/matchPropertyFailedResult/types';
import { valueUseCase } from '@/usecases/valueUseCase';

export const triggerWatchers = <T>(watch: EntityWatchMap<T>, newEntity: T, oldEntity: T): void => {
  const { matchProperty } = valueUseCase();

  for (const [fieldPath, watcher] of Object.entries(watch)) {
    matchProperty(oldEntity, newEntity, fieldPath, (result: MatchPropertyFailedResult<T>): void => {
      (watcher as EntityWatcher<T>)(result);
    });
  }
};
