import { UseCaseProvider } from '../useProvider/types';
import { UseCase } from '@mic-rexjs/usecases';
import {
  EntityReducerMap,
  EntityReducers,
  InferableEntityUseCase,
  ReducerMap,
  RestArguments,
  SymbolSet,
  SymbolSetTarget,
} from '@mic-rexjs/usecases/es/types';
import { MatchPropertyFailedResult } from '@/entities/matchPropertyFailedResult/types';
import { Dependencies } from '@/types';
import { ContextualEntityReducers } from '@/usecases/contextUseCase/types';

export interface NonEntitySymbolSet extends SymbolSet {
  entity?: never;
}

export type CoreCollection<T, TEntityReducers extends EntityReducerMap<T>> = [
  entity: T,
  reducers: ContextualEntityReducers<T, TEntityReducers>,
  Provider: UseCaseProvider,
];

/**
 * @deprecated 请用 `CoreCollection` 代替
 */
export type RootCoreCollection<T, TEntityReducers extends EntityReducerMap<T>> = CoreCollection<T, TEntityReducers>;

/**
 * @deprecated 请用 `CoreCollection` 代替
 */
export type ContextualCoreCollection<T, TEntityReducers extends EntityReducerMap<T>> = CoreCollection<
  T,
  TEntityReducers
>;

export interface EntityGetter<T, TDependencies extends Dependencies = Dependencies> {
  (entity: T | undefined, changedDeps: TDependencies): T;
}

export interface EntityWatchEvent<T, TValue = unknown> extends MatchPropertyFailedResult<T, TValue> {}

export interface EntityWatcher<T, TValue = unknown> {
  (event: EntityWatchEvent<T, TValue>): void;
}

// 几个点就是几层，所以这里默认最多 2 层，因为超过 2 层就会报层级过深的问题
export type PathTemplate = '1.2.3';

export type NextPathTemplate<T extends string> = T extends `${string}.${infer U}` ? U : T;

export type PropertyPath<
  T,
  TTemplate extends string,
  K extends keyof T = keyof T & string,
> = TTemplate extends `${string}.${string}`
  ? K extends infer TKey
    ? `${TKey & (string | number)}${'' | DotAccessorFieldPath<T[TKey & keyof T], TTemplate>}`
    : never
  : never;

export type DotAccessorFieldPath<T, TTemplate extends string> = TTemplate extends `${string}.${string}`
  ? T extends RestArguments
    ? '.length' | `${'' | `.${number}`}${DotAccessorFieldPath<T[number], NextPathTemplate<TTemplate>>}`
    : T extends object
      ? `.${PropertyPath<T, NextPathTemplate<TTemplate>>}`
      : ''
  : '';

export type FieldPath<T, TTemplate extends string = PathTemplate> = TTemplate extends `${string}.${string}`
  ? T extends RestArguments
    ? FieldPath<T[number], NextPathTemplate<TTemplate>> | 'length'
    : T extends object
      ? PropertyPath<T, TTemplate>
      : never
  : never;

export type ExtractPropertyType<T, TPath> = TPath extends `${infer TKey}.${infer TSubPath}`
  ? T extends RestArguments
    ? ExtractPropertyType<T[number], TKey extends `${number}` ? TSubPath : TPath>
    : ExtractPropertyType<T[TKey & keyof T], TSubPath>
  : T extends RestArguments
    ? TPath extends 'length'
      ? T[TPath]
      : TPath extends `${number}`
        ? T[number]
        : ExtractPropertyType<T[number], TPath>
    : T[TPath & keyof T];

export type ExtractFieldType<T, TPath> = TPath extends `${infer TKey}.${infer TSubProperty}`
  ? ExtractPropertyType<T[TKey & keyof T], TSubProperty>
  : T[TPath & keyof T];

export type EntityWatchMap<T> = {
  [K in FieldPath<T>]?: EntityWatcher<T, ExtractFieldType<T, K>>;
};

export interface UseCaseHookContextualOptions<T> {
  watch?: EntityWatchMap<T>;

  onChange?(newEntity: T, oldEntity: T): void;
}

export interface UseCaseHookOwnOptions<T, TUseCaseOptions extends object> extends UseCaseHookContextualOptions<T> {
  options?: TUseCaseOptions;
}

export type UnextendFunctionTypes<T> = T extends (...args: infer TArgs) => infer TReturn
  ? (...args: TArgs) => TReturn
  : T;

export type UnextendOptionTypes<T> = {
  [K in keyof T]: UnextendFunctionTypes<T[K]>;
};

export type UseCaseHookOptions<T, TUseCaseOptions extends object = object> =
  // 这里要接触 `S extends T` 的关系，因为 `reducers` 里面的函数在去除 `entity` 时，也经过了这个步骤
  UnextendOptionTypes<TUseCaseOptions> & UseCaseHookOwnOptions<T, TUseCaseOptions>;

export interface ReducersHook {
  <T extends ReducerMap, TUseCaseOptions extends object = object>(
    usecase: UseCase<T & SymbolSetTarget<NonEntitySymbolSet>, TUseCaseOptions>,
    options?: TUseCaseOptions,
    deps?: Dependencies,
  ): T;
}

export interface ContextualCoreCollectionHook {
  <T, TEntityReducers extends EntityReducerMap<T>>(
    usecase: InferableEntityUseCase<T, TEntityReducers>,
    options?: UseCaseHookContextualOptions<T>,
    deps?: Dependencies,
  ): CoreCollection<T, TEntityReducers>;
}

export interface RootCoreCollectionHook {
  <
    T,
    TEntityReducers extends EntityReducerMap<T>,
    TUseCaseOptions extends object = object,
    TDependencies extends Dependencies = Dependencies,
  >(
    entity: T | EntityGetter<T, TDependencies>,
    usecase: InferableEntityUseCase<T, TEntityReducers & EntityReducers<T>, TUseCaseOptions>,
    options?: UseCaseHookOptions<T, TUseCaseOptions>,
    deps?: TDependencies,
  ): CoreCollection<T, EntityReducers<T, TEntityReducers>>;
}

export interface CoreCollectionHook extends ContextualCoreCollectionHook, RootCoreCollectionHook {}

export type UseCaseHookParameters =
  | Parameters<ReducersHook>
  | Parameters<ContextualCoreCollectionHook>
  | Parameters<RootCoreCollectionHook>;

// 需按顺序排列
export interface UseCaseHook extends ReducersHook, CoreCollectionHook {}
