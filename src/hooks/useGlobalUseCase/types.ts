import { EntityReducers } from '@mic-rexjs/usecases';
import {
  ContextualCoreCollectionHookParameters,
  RootCoreCollectionHook,
  RootCoreCollectionHookParameters,
} from '../useUseCase/types';
import { ContextualEntityReducers } from '@/configs/defaultUseCaseContext/types';

export interface GlobalReducersHookParameters<T, TEntityReducers extends EntityReducers<T>>
  extends ContextualCoreCollectionHookParameters<T, TEntityReducers> {}

export type GlobalReducers<T, TEntityReducers extends EntityReducers<T>> = ContextualEntityReducers<T, TEntityReducers>;

export interface GlobalReducersHook {
  <T, TEntityReducers extends EntityReducers<T>>(
    ...args: GlobalReducersHookParameters<T, TEntityReducers>
  ): GlobalReducers<T, TEntityReducers>;
}

export type GlobalUseCaseHookParameters<
  T,
  TEntityReducers extends EntityReducers<T>,
  TUseCaseOptions extends object = object
> =
  | RootCoreCollectionHookParameters<T, TEntityReducers, TUseCaseOptions>
  | GlobalReducersHookParameters<T, TEntityReducers>;

export interface GlobalUseCaseHook extends RootCoreCollectionHook, GlobalReducersHook {}
