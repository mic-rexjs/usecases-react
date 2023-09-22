import { EntityReducers, EntityUseCase } from '@mic-rexjs/usecases';
import { EntityWatchMap } from '../../hooks/useUseCase/types';

export interface UseCaseFragmentProps<T, TReducers extends EntityReducers<T>> {
  usecase: EntityUseCase<T, TReducers & EntityReducers<T>>;

  watch?: EntityWatchMap<T>;

  onChange?(prevEntity: T, nextEntity: T): void;
}
