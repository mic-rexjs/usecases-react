import { EntityReducers, EntityUseCase } from '@mic-rexjs/usecases';
import { UseCaseContextValue } from '../defaultUseCaseContext/types';

export interface UseCaseMappingContext<
  T,
  TEntityReducers extends EntityReducers<T>,
  TUseCaseOptions extends object = object
> extends React.Context<UseCaseContextValue<T, TEntityReducers, TUseCaseOptions>> {}

export interface UseCaseContextMap<
  T,
  TEntityReducers extends EntityReducers<T>,
  TUseCaseOptions extends object = object
> extends Map<
    EntityUseCase<T, TEntityReducers, TUseCaseOptions>,
    UseCaseMappingContext<T, TEntityReducers, TUseCaseOptions>
  > {}
