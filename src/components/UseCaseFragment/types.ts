import { EntityReducers, EntityUseCase, UseCase } from '@mic-rexjs/usecases';

export interface UseCaseFragmentProps<T, TEntityReducers extends EntityReducers<T>> {
  usecase: EntityUseCase<T, TEntityReducers> & UseCase<EntityReducers<T>>;

  onChange?(newEntity: T, oldEntity: T): void;
}
