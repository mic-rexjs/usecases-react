import { EntityGetter, UseCaseHookContextualOptions, UseCaseHookOptions } from '@/hooks/useUseCase/types';
import { EntityReducers, EntityUseCase, UseCase } from '@mic-rexjs/usecases';
import { ReducerMap } from '@mic-rexjs/usecases/es/types';

export type FullParameters<T, TReducers extends ReducerMap, TUseCaseOptions extends object> = [
  entity: T | EntityGetter<T>,
  usecase: UseCase<TReducers, TUseCaseOptions> | EntityUseCase<T, TReducers & EntityReducers<T>, TUseCaseOptions>,
  options: TUseCaseOptions | UseCaseHookOptions<T, TUseCaseOptions> | UseCaseHookContextualOptions<T>,
  deps: unknown[],
];
