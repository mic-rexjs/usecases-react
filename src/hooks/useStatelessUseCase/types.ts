import { EntityReducers } from '@mic-rexjs/usecases';
import {
  ContextualCoreCollectionHook,
  ContextualCoreCollectionHookParameters,
  RootCoreCollectionHook,
  RootCoreCollectionHookParameters,
} from '../useUseCase/types';

export type StatelessUseCaseHookParameters<
  T,
  TEntityReducers extends EntityReducers<T>,
  TUseCaseOptions extends object = object
> =
  | RootCoreCollectionHookParameters<T, TEntityReducers, TUseCaseOptions>
  | ContextualCoreCollectionHookParameters<T, TEntityReducers>;

export interface StatelessUseCaseHook extends RootCoreCollectionHook, ContextualCoreCollectionHook {}
