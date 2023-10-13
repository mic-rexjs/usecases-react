import { OptionsGetterCollectionReducers } from '../../core/usecases/optionsGetterCellectionUseCase/types';
import { AsyncEntityGenerator, EntityGenerator, EntityReducers, EntityUseCase } from '@mic-rexjs/usecases';

export type ContextualEntityReducer<T, TReducer> = TReducer extends (entity: T, ...args: infer TArgs) => infer TReturn
  ? (
      ...args: TArgs
    ) => TReturn extends AsyncEntityGenerator<T, infer TResult>
      ? Promise<TResult>
      : TReturn extends EntityGenerator<T, infer TResult>
      ? TResult
      : TReturn
  : never;

export type ContextualEntityReducers<T, TReducers> = {
  [K in keyof TReducers]: ContextualEntityReducer<T, TReducers[K]>;
};

export type UseCaseContext<T, TReducers> = [entity: T, reducers: ContextualEntityReducers<T, TReducers>];

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
