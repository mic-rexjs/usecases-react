import { EntityGetter, UseCaseHookContextualOptions, UseCaseHookOptions } from '@/hooks/useUseCase/types';
import { EntityReducers, EntityUseCase, Reducers, UseCase } from '@mic-rexjs/usecases';

export type UseCaseHookFullParameters<T, TReducers extends Reducers, TUseCaseOptions extends object> = [
  entity: T | EntityGetter<T>,
  usecase: UseCase<TReducers, TUseCaseOptions> | EntityUseCase<T, TReducers & EntityReducers<T>, TUseCaseOptions>,
  options: TUseCaseOptions | UseCaseHookOptions<T, TUseCaseOptions> | UseCaseHookContextualOptions<T>,
  deps: unknown[],
];
