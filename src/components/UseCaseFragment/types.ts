import { EntityReducers, EntityUseCase } from '@rex-js/usecases/es/types';
import { EntityWatchMap } from '../../hooks/useUseCase/types';

export interface UseCaseFragmentProps<T, TReducers extends EntityReducers<T>> {
  usecase: EntityUseCase<T, TReducers & EntityReducers<T>>;

  watch?: EntityWatchMap<T>;

  onChange?(prevEntity: T, nextEntity: T): void;
}
