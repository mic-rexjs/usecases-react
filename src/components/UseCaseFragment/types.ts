import { EntityWatchMap } from '../../hooks/useUseCase/types';
import { EntityReducerMap, InferableEntityUseCase } from '@mic-rexjs/usecases/es/types';

export interface UseCaseFragmentProps<T, TEntityReducers extends EntityReducerMap<T>> {
  usecase: InferableEntityUseCase<T, TEntityReducers>;

  watch?: EntityWatchMap<T>;

  onChange?(newEntity: T, oldEntity: T): void;
}
