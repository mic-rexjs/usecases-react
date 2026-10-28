import {
  AsyncEntityGenerator,
  EntityGenerator,
  EntityReducer,
  EntityStore,
  ReducerKeys,
  Reducers,
} from '@mic-rexjs/usecases';
import { EntityReducerMap, EntityUseCase, ReducerMap } from '@mic-rexjs/usecases/es/types';
import { Statuses } from '@/enums/Statuses';

export interface UseCaseContextValue<T extends ReducerMap> {
  key: React.Key;

  reducers: T;

  statuses: Statuses;
}

export interface EntityUseCaseContextValue<T, TEntityReducers extends EntityReducerMap<T>> extends UseCaseContextValue<
  ContextualEntityReducers<T, TEntityReducers>
> {
  store: EntityStore<T>;
}

export interface UseCaseContext<T> extends React.Context<T | null> {}

export interface UseCaseContextReference<T> {
  value: UseCaseContext<T>;

  times: number;
}

export type ContextualEntityReducer<T, TEntityReducer extends EntityReducer<T>> = TEntityReducer extends (
  // 不能使用 `T`, 假设 `T = 1` 而且 `TEntityReducer = EntityReducer<number>`，那么下面推导就会不成立
  entity: infer TEntity,
  ...args: infer TArgs
) => infer TReturn
  ? (
      ...args: TArgs
    ) => TReturn extends AsyncEntityGenerator<TEntity, infer TResult>
      ? Promise<TResult>
      : TReturn extends EntityGenerator<TEntity, infer TResult>
        ? TResult
        : TReturn
  : never;

export type ContextualEntityReducers<T, TEntityReducers extends EntityReducerMap<T>> = {
  [K in ReducerKeys<TEntityReducers>]: ContextualEntityReducer<T, TEntityReducers[K]>;
};

export type ContextReducers = Reducers<{
  getContext<T, TEntityReducers extends EntityReducerMap<T>, TUseCaseOptions extends object>(
    usecase: EntityUseCase<T, TEntityReducers, TUseCaseOptions>,
  ): UseCaseContext<EntityUseCaseContextValue<T, TEntityReducers>>;

  registerUseCase<T, TEntityReducers extends EntityReducerMap<T>, TUseCaseOptions extends object>(
    usecase: EntityUseCase<T, TEntityReducers, TUseCaseOptions>,
  ): UseCaseContext<EntityUseCaseContextValue<T, TEntityReducers>>;

  unregisterUseCase<T, TEntityReducers extends EntityReducerMap<T>, TUseCaseOptions extends object>(
    usecase: EntityUseCase<T, TEntityReducers, TUseCaseOptions>,
  ): boolean;
}>;

export interface ContextUseCase {
  (): ContextReducers;
}
