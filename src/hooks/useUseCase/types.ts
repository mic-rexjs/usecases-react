import { EntityReducers, EntityUseCase, Reducers, UseCase } from '@rex-js/usecases/es/types';
import { UseCaseContext, UseCaseContextWithProvider } from '../../configs/usecaseContextMap/types';

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

export interface UseCaseHookOwnOptions<T> extends UseCaseHookContextualOptions<T> {
  stateless?: boolean;
}

export type UseCaseHookOptions<T, TOptions extends object> = TOptions & UseCaseHookOwnOptions<T>;

export interface UseCaseHook {
  <
    T,
    TReducers extends EntityReducers<T>,
    TOptions extends UseCaseHookContextualOptions<T> = UseCaseHookContextualOptions<T>
  >(
    usecase: EntityUseCase<T, TReducers & EntityReducers<T>>,
    options?: TOptions
  ): UseCaseContext<T, TReducers>;

  <
    T,
    TReducers extends EntityReducers<T>,
    TUseCaseOptions extends object = object,
    TOptions extends UseCaseHookOptions<T, TUseCaseOptions> = UseCaseHookOptions<T, TUseCaseOptions>
  >(
    defaultEntity: T | EntityGetter<T>,
    usecase: EntityUseCase<T, TReducers, TUseCaseOptions> & UseCase<TReducers, TUseCaseOptions>,
    options?: TOptions,
    deps?: unknown[]
  ): UseCaseContextWithProvider<T, TReducers>;

  <T extends Reducers, TOptions extends object = object>(
    usecase: UseCase<T, TOptions>,
    options?: TOptions,
    deps?: unknown[]
  ): T;
}