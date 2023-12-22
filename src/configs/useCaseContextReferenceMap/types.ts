import { EntityReducers, EntityUseCase } from '@mic-rexjs/usecases';
import { UseCaseContext } from '../defaultUseCaseContext/types';

export interface UseCaseContextReference<
  T,
  TEntityReducers extends EntityReducers<T>,
  TContext extends UseCaseContext<T, TEntityReducers> = UseCaseContext<T, TEntityReducers>
> {
  value: TContext;

  times: number;
}

export interface UseCaseContextReferenceMap<
  T,
  TEntityReducers extends EntityReducers<T>,
  TUseCaseOptions extends object = object,
  TContext extends UseCaseContext<T, TEntityReducers> = UseCaseContext<T, TEntityReducers>
> extends Map<
    EntityUseCase<T, TEntityReducers, TUseCaseOptions>,
    UseCaseContextReference<T, TEntityReducers, TContext>
  > {}
