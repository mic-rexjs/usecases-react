import { UseCaseStatuses } from '@/enums/UseCaseStatuses';
import {
  AsyncEntityGenerator,
  EntityGenerator,
  EntityReducer,
  EntityReducers,
  EntityStore,
  ReducerKeys,
  Reducers,
} from '@mic-rexjs/usecases';

export interface ChangeCallback<T> {
  (newEntity: T, oldEntity: T): void;
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

export type ContextualEntityReducers<T, TEntityReducers extends EntityReducers<T>> = {
  [K in ReducerKeys<TEntityReducers>]: ContextualEntityReducer<T, TEntityReducers[K]>;
};

export interface UseCaseContextValue<T extends Reducers> {
  reducers: T;

  statuses: UseCaseStatuses;
}

export interface EntityUseCaseContextValue<T, TEntityReducers extends EntityReducers<T>>
  extends UseCaseContextValue<ContextualEntityReducers<T, TEntityReducers>> {
  store: EntityStore<T>;
}

export interface UseCaseContext<T> extends React.Context<T | null> {}
