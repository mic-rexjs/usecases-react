import { EntityReducerMap, EntityUseCase, UseCase } from '@mic-rexjs/usecases';
import { EntityWatchMap } from '../../hooks/useUseCase/types';

export interface UseCaseFragmentProps<T, TEntityReducers extends EntityReducerMap<T>> {
  usecase: EntityUseCase<T, TEntityReducers> & UseCase<EntityReducerMap<T>>;

  watch?: EntityWatchMap<T>;

  onChange?(newEntity: T, oldEntity: T): void;
}
