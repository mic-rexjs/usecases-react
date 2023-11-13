import { ContextualEntityReducers } from '@/configs/defaultUseCaseContext/types';
import { EntityReducers, EntityUseCase, Reducers, UseCase } from '@mic-rexjs/usecases';
import { UseCaseProvider } from '../useProvider/types';

export type CoreCollection<
  T,
  TEntityReducers extends EntityReducers<T>,
  TProvide extends UseCaseProvider | null = UseCaseProvider
> = [entity: T, reducers: ContextualEntityReducers<T, TEntityReducers>, Provider: TProvide];

export interface EntityGetter<T> {
  (): T;
}

export interface EntityWatcher<T> {
  (newEntity: T, prevEntity: T): void;
}

export type EntityWatchMap<T> = T extends unknown[]
  ? Record<number, EntityWatcher<T>>
  : T extends object
  ? {
      [K in keyof T]?: EntityWatcher<T>;
    }
  : object;

export interface UseCaseHookContextualOptions<T> {
  watch?: EntityWatchMap<T>;

  onChange?(newEntity: T, prevEntity: T): void;
}

export interface UseCaseHookOwnOptions<T, TUseCaseOptions extends object> extends UseCaseHookContextualOptions<T> {
  stateless?: boolean;

  options?: TUseCaseOptions;
}

export type UseCaseHookOptions<T, TUseCaseOptions extends object = object> = TUseCaseOptions &
  UseCaseHookOwnOptions<T, TUseCaseOptions>;

export interface UseCaseHook {
  <T, TEntityReducers extends EntityReducers<T>>(
    usecase: EntityUseCase<T, TEntityReducers & EntityReducers<T>> & UseCase<TEntityReducers>,
    options?: UseCaseHookContextualOptions<T>
  ): CoreCollection<T, TEntityReducers, null>;

  <T, TEntityReducers extends EntityReducers<T>, TUseCaseOptions extends object = object>(
    initailEntity: T | EntityGetter<T>,
    usecase: EntityUseCase<T, TEntityReducers, TUseCaseOptions> & UseCase<TEntityReducers, TUseCaseOptions>,
    options?: UseCaseHookOptions<T, TUseCaseOptions>,
    deps?: unknown[]
  ): CoreCollection<T, TEntityReducers>;

  <T extends Reducers, TUseCaseOptions extends object = object>(
    usecase: UseCase<T, TUseCaseOptions>,
    options?: TUseCaseOptions,
    deps?: unknown[]
  ): T;
}
