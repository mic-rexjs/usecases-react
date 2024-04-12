import { EntityReducers, EntityUseCase, Reducers, UseCase } from '@mic-rexjs/usecases';
import { UseCaseProvider } from '../useProvider/types';
import { UseCaseModes } from '@/enums/UseCaseModes';
import { ContextualEntityReducers } from '@/configs/defaultUseCaseContext/types';
import { SymbolSet, SymbolSetTarget } from '@mic-rexjs/usecases/es/types';

export interface NonEntitySymbolSet extends SymbolSet {
  entity?: never;
}

export type RootCoreCollection<T, TEntityReducers extends EntityReducers<T>> = [
  entity: T,
  reducers: ContextualEntityReducers<T, TEntityReducers>,
  Provider: UseCaseProvider,
];

export type ContextualCoreCollection<T, TEntityReducers extends EntityReducers<T>> = [
  entity: T,
  reducers: ContextualEntityReducers<T, TEntityReducers>,
];

export type CoreCollection<T, TEntityReducers extends EntityReducers<T>> =
  | RootCoreCollection<T, TEntityReducers>
  | ContextualCoreCollection<T, TEntityReducers>;

export interface EntityGetter<T> {
  (): T;
}

export type PropertyPath<T, K extends keyof T = keyof T & string> = K extends infer TKey
  ? `${TKey & (string | number)}${'' | DotAccessorFieldPath<T[TKey & keyof T]>}`
  : never;

export type DotAccessorFieldPath<T> = T extends unknown[]
  ? '.length' | `${'' | `.${number}`}${DotAccessorFieldPath<T[number]>}`
  : T extends object
    ? `.${PropertyPath<T>}`
    : '';

export type FieldPath<T> = T extends unknown[]
  ? FieldPath<T[number]> | 'length'
  : T extends object
    ? PropertyPath<T>
    : never;

export type ExtractPropertyType<T, TPath> = TPath extends `${infer TKey}.${infer TSubPath}`
  ? T extends unknown[]
    ? ExtractPropertyType<T[number], TKey extends `${number}` ? TSubPath : TPath>
    : ExtractPropertyType<T[TKey & keyof T], TSubPath>
  : T extends unknown[]
    ? TPath extends 'length'
      ? T[TPath]
      : TPath extends `${number}`
        ? T[number]
        : ExtractPropertyType<T[number], TPath>
    : T[TPath & keyof T];

export type ExtractFieldType<T, TPath> = TPath extends `${infer TKey}.${infer TSubProperty}`
  ? ExtractPropertyType<T[TKey & keyof T], TSubProperty>
  : T[TPath & keyof T];

export interface UseCaseHookContextualOptions<T> {
  onChange?(newEntity: T, oldEntity: T): void;
}

export interface UseCaseHookOwnOptions<T, TUseCaseOptions extends object> extends UseCaseHookContextualOptions<T> {
  options?: TUseCaseOptions;
}

export type UseCaseHookOptions<T, TUseCaseOptions extends object = object> = TUseCaseOptions &
  UseCaseHookOwnOptions<T, TUseCaseOptions>;

export interface ReducersHook {
  <T extends Reducers, TUseCaseOptions extends object = object>(
    usecase: UseCase<T & SymbolSetTarget<NonEntitySymbolSet>, TUseCaseOptions>,
    options?: TUseCaseOptions,
    deps?: unknown[],
  ): T;
}

export interface ContextualCoreCollectionHook {
  <T, TEntityReducers extends EntityReducers<T>>(
    usecase: EntityUseCase<T, TEntityReducers> & UseCase<EntityReducers<T>>,
    options?: UseCaseHookContextualOptions<T>,
    deps?: unknown[],
  ): ContextualCoreCollection<T, TEntityReducers>;
}

export interface RootCoreCollectionHook {
  <T, TEntityReducers extends EntityReducers<T>, TUseCaseOptions extends object = object>(
    entity: T | EntityGetter<T>,
    usecase: EntityUseCase<T, TEntityReducers, TUseCaseOptions> & UseCase<EntityReducers<T>, TUseCaseOptions>,
    options?: UseCaseHookOptions<T, TUseCaseOptions>,
    deps?: unknown[],
  ): RootCoreCollection<T, TEntityReducers>;
}

export interface ModeCoreCollectionHook {
  <T, TEntityReducers extends EntityReducers<T>, TUseCaseOptions extends object = object>(
    entity: T | EntityGetter<T>,
    usecase: EntityUseCase<T, TEntityReducers, TUseCaseOptions> & UseCase<EntityReducers<T>, TUseCaseOptions>,
    // 不能用可选，不然无法准确识别参数
    mode: UseCaseModes,
    options?: UseCaseHookOptions<T, TUseCaseOptions>,
    deps?: unknown[],
  ): RootCoreCollection<T, TEntityReducers>;
}

export interface CoreCollectionHook
  extends ContextualCoreCollectionHook,
    RootCoreCollectionHook,
    ModeCoreCollectionHook {}

export type UseCaseHookParameters =
  | Parameters<ReducersHook>
  | Parameters<ContextualCoreCollectionHook>
  | Parameters<RootCoreCollectionHook>
  | Parameters<ModeCoreCollectionHook>;

// 需按顺序排列
export interface UseCaseHook extends ReducersHook, CoreCollectionHook {}
