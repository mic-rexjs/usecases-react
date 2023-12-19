import { AsyncEntityGenerator, EntityGenerator, EntityReducer, EntityReducers } from '@mic-rexjs/usecases';

export type ContextualEntityReducer<T, TReducer extends EntityReducer<T>> = TReducer extends (
  entity: T,
  ...args: infer TArgs
) => infer TReturn
  ? (
      ...args: TArgs
    ) => TReturn extends AsyncEntityGenerator<T, infer TResult>
      ? Promise<TResult>
      : TReturn extends EntityGenerator<T, infer TResult>
      ? TResult
      : TReturn
  : never;

export type ContextualEntityReducers<T, TEntityReducers extends EntityReducers<T>> = {
  [K in keyof TEntityReducers]: ContextualEntityReducer<T, TEntityReducers[K]>;
};

export interface ChangeCallback<T> {
  (newEntity: T, oldEntity: T): void;
}

export interface UseCaseContextValue<T, TEntityReducers extends EntityReducers<T>> {
  entity?: T;

  reducers?: ContextualEntityReducers<T, TEntityReducers>;

  changeCallbackCollection?: ChangeCallback<T>[];
}

export interface UseCaseContextValueGetter<T, TEntityReducers extends EntityReducers<T>> {
  (): UseCaseContextValue<T, TEntityReducers>;
}

export interface UseCaseContext<T, TEntityReducers extends EntityReducers<T>>
  extends React.Context<UseCaseContextValueGetter<T, TEntityReducers> | null> {}
