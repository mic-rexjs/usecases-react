import { Reducers, UseCase } from '@mic-rexjs/usecases';
import { UseCaseContext, UseCaseContextValue } from '../defaultUseCaseContext/types';

export interface UseCaseContextReference<T> {
  value: UseCaseContext<T>;

  times: number;
}

export interface UseCaseContextReferenceMap<
  T extends Reducers,
  TUseCaseOptions extends object,
  TContextValue extends UseCaseContextValue<T> = UseCaseContextValue<T>,
  TKey extends UseCase<T, TUseCaseOptions> = UseCase<T, TUseCaseOptions>,
  TValue extends UseCaseContextReference<TContextValue> = UseCaseContextReference<TContextValue>,
> extends Map<TKey, TValue> {}
