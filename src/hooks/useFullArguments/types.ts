import { EntityReducers, EntityUseCase, UseCase } from '@mic-rexjs/usecases';
import { ReducerMap } from '@mic-rexjs/usecases/es/types';
import { ContextualUseCaseHookOptions, UseCaseHookOptions } from '@/hooks/useUseCase/types';
import { Dependencies, EntityInitializer } from '@/types';

export type FullParameters<T, TReducers extends ReducerMap, TUseCaseOptions extends object> = [
  entity: T | EntityInitializer<T>,
  usecase: UseCase<TReducers, TUseCaseOptions> | EntityUseCase<T, TReducers & EntityReducers<T>, TUseCaseOptions>,
  options: TUseCaseOptions | UseCaseHookOptions<T, TUseCaseOptions> | ContextualUseCaseHookOptions<T>,
  deps: Dependencies,
];
