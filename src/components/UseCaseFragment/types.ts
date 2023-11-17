import { EntityReducers, EntityUseCase } from '@mic-rexjs/usecases';
import { EntityWatchMap } from '../../hooks/useUseCase/types';

export interface UseCaseFragmentProps<T, TEntityReducers extends EntityReducers<T>> {
  usecase: EntityUseCase<T, TEntityReducers & EntityReducers<T>>;

  watch?: EntityWatchMap<T>;

  onChange?(newEntity: T, oldEntity: T): void;
}
