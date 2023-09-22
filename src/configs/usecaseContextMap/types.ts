import { OptionsGetterCollectionReducers } from '../../core/usecases/optionsGetterCellectionUseCase/types';
import { AsyncEntityGenerator, EntityGenerator, EntityReducers, EntityUseCase } from '@mic-rexjs/usecases';

export type ContextualEntityReducer<T> = T extends (entity: infer TEntity, ...args: infer TArgs) => infer TReturn
  ? (
      ...args: TArgs
    ) => TReturn extends AsyncEntityGenerator<TEntity, infer TResult>
      ? Promise<TResult>
      : TReturn extends EntityGenerator<TEntity, infer TResult>
      ? TResult
      : TReturn
  : never;

export type ContextualEntityReducers<T> = {
  [K in keyof T]: ContextualEntityReducer<T[K]>;
};

export type UseCaseContext<T, TReducers> = [entity: T, reducers: ContextualEntityReducers<TReducers>];

export type UseCaseContextWithCollectionReducers<T, TReducers, TOptions> = [
  ...context: UseCaseContext<T, TReducers>,
  collectionReducers: OptionsGetterCollectionReducers<TOptions>
];

export interface UseCaseProvider extends React.FC<React.PropsWithChildren> {}

export type UseCaseContextWithProvider<T, TReducers> = [
  ...args: UseCaseContext<T, TReducers>,
  Provider: UseCaseProvider
];

export interface UseCaseContextMap<T, TReducers extends EntityReducers<T>, TOptions = object>
  extends Map<
    EntityUseCase<T, TReducers>,
    React.Context<UseCaseContextWithCollectionReducers<T, TReducers, TOptions> | null>
  > {}
