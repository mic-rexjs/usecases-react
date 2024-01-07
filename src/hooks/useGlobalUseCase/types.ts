import { EntityReducers, ReducerMap, Reducers, UseCase } from '@mic-rexjs/usecases';
import { PseudoCoreCollection, RootCoreCollection, RootCoreCollectionHook } from '../useUseCase/types';

export type GlobalCoreCollection<T, TReducers extends ReducerMap> = TReducers extends EntityReducers<T>
  ? RootCoreCollection<T, TReducers>
  : PseudoCoreCollection<TReducers>;

export interface GlobalPseudoCoreCollectionHook {
  <T extends Reducers, TUseCaseOptions extends object = object>(
    usecase: UseCase<T, TUseCaseOptions>,
    options?: TUseCaseOptions,
    deps?: unknown[]
  ): PseudoCoreCollection<T>;
}

export type GlobalUseCaseHookParameters =
  | Parameters<RootCoreCollectionHook>
  | Parameters<GlobalPseudoCoreCollectionHook>;

export interface GlobalUseCaseHook extends RootCoreCollectionHook, GlobalPseudoCoreCollectionHook {}
