import { EntityReducers, EntityUseCase } from '@mic-rexjs/usecases';
import { UseCaseContext } from '../defaultUseCaseContext/types';

export interface UseCaseContextMap<
  T,
  TEntityReducers extends EntityReducers<T>,
  TUseCaseOptions extends object = object
> extends Map<EntityUseCase<T, TEntityReducers, TUseCaseOptions>, UseCaseContext<T, TEntityReducers>> {}
