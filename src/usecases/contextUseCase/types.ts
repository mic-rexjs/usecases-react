import {
  AsyncEntityGenerator,
  EntityGenerator,
  EntityReducer,
  EntityStore,
  ReducerKeys,
  Reducers,
} from '@mic-rexjs/usecases';
import { EntityReducerMap, InferableUseCase, ReducerMap } from '@mic-rexjs/usecases/es/types';
import { ArgumentTypes } from '@/enums/ArgumentTypes';
import { Statuses } from '@/enums/Statuses';

export interface UseCaseContextValue<T extends ReducerMap> {
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
  createContextValue<T, TReducers extends ReducerMap>(
    store: EntityStore<T>,
    reducers: TReducers,
    statuses: Statuses,
  ): UseCaseContextValue<TReducers>;

  getUseCaseContext<T extends ReducerMap, TUseCaseOptions extends object>(
    usecase: InferableUseCase<T, TUseCaseOptions>,
  ): UseCaseContext<UseCaseContextValue<T>>;

  registerUseCase<T extends ReducerMap, TUseCaseOptions extends object>(
    usecase: InferableUseCase<T, TUseCaseOptions>,
    argumentTypes: ArgumentTypes,
  ): UseCaseContext<UseCaseContextValue<T>>;

  unregisterUseCase<T extends ReducerMap, TUseCaseOptions extends object>(
    usecase: InferableUseCase<T, TUseCaseOptions>,
    argumentTypes: ArgumentTypes,
  ): boolean;
}>;

export interface ContextUseCase {
  (): ContextReducers;
}
