import { UseCaseModes } from '@/enums/UseCaseModes';
import { EntityGetter, UseCaseHookContextualOptions, UseCaseHookOptions } from '@/hooks/useUseCase/types';
import { EntityReducerMap, EntityUseCase, ReducerMap, UseCase } from '@mic-rexjs/usecases';

export type UseCaseHookFullParameters<T, TReducers extends ReducerMap, TUseCaseOptions extends object> = [
  entity: T | EntityGetter<T>,
  usecase: UseCase<TReducers, TUseCaseOptions> | EntityUseCase<T, TReducers & EntityReducerMap<T>, TUseCaseOptions>,
  mode: UseCaseModes,
  options: TUseCaseOptions | UseCaseHookOptions<T, TUseCaseOptions> | UseCaseHookContextualOptions<T>,
  deps: unknown[],
];
