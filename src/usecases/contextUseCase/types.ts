import { ArgumentTypes } from '@/enums/ArgumentTypes';
import { Statuses } from '@/enums/Statuses';

import {
  AsyncEntityGenerator,
  EntityGenerator,
  EntityReducer,
  EntityStore,
  ReducerKeys,
  Reducers,
} from '@mic-rexjs/usecases';

import { EntityReducerMap, InferableEntityUseCase, InferableUseCase, ReducerMap } from '@mic-rexjs/usecases/es/types';

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

export interface ContextValue<T extends ReducerMap> {
  reducers: T;

  statuses: Statuses;
}

export interface EntityContextValue<T, TEntityReducers extends EntityReducerMap<T>>
  extends ContextValue<ContextualEntityReducers<T, TEntityReducers>> {
  store: EntityStore<T>;
}

export interface Context<T> extends React.Context<T | null> {}

export interface ContextReference<T> {
  value: Context<T>;

  times: number;
}

export type ContextReducers = Reducers<{
  createContextValue<T, TReducers extends ReducerMap>(
    store: EntityStore<T>,
    reducers: TReducers,
    statuses: Statuses,
  ): ContextValue<TReducers>;

  getGlobalContextValue<
    T,
    TEntityReducers extends EntityReducerMap<T>,
    TContextValue extends ContextValue<TEntityReducers> = ContextValue<TEntityReducers>,
  >(
    key: Context<TContextValue>,
  ): TContextValue;

  getGlobalContextValue<T, TEntityReducers extends EntityReducerMap<T>>(
    usecase: InferableEntityUseCase<T, TEntityReducers>,
  ): ContextValue<TEntityReducers> | null;

  isGlobal<T>(usecase: InferableEntityUseCase<T>): boolean;

  registerUseCase<
    T extends ReducerMap,
    TUseCaseOptions extends object,
    TContext extends Context<ContextValue<T>> = Context<ContextValue<T>>,
  >(
    usecase: InferableUseCase<T, TUseCaseOptions>,
    argumentTypes: ArgumentTypes,
  ): TContext;

  unregisterUseCase<T extends ReducerMap, TUseCaseOptions extends object>(
    usecase: InferableUseCase<T, TUseCaseOptions>,
    argumentTypes: ArgumentTypes,
  ): boolean;

  registerGlobalUseCase<T>(entity: T, usecase: InferableEntityUseCase<T>): void;

  unregisterGlobalUseCase<T>(usecase: InferableEntityUseCase<T>): boolean;
}>;

export interface ContextUseCase {
  (): ContextReducers;
}
