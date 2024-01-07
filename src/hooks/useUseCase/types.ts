import { EntityReducerMap, EntityReducers, EntityUseCase, ReducerMap, Reducers, UseCase } from '@mic-rexjs/usecases';
import { UseCaseProvider } from '../useProvider/types';
import { UseCaseModes } from '@/enums/UseCaseModes';
import { ContextualEntityReducers } from '@/configs/defaultUseCaseContext/types';

export type RootCoreCollection<T, TEntityReducers extends EntityReducerMap<T>> = [
  entity: T,
  reducers: ContextualEntityReducers<T, TEntityReducers>,
  Provider: UseCaseProvider
];

export type ContextualCoreCollection<T, TEntityReducers extends EntityReducerMap<T>> = [
  entity: T,
  reducers: ContextualEntityReducers<T, TEntityReducers>
];

export type CoreCollection<T, TEntityReducers extends EntityReducerMap<T>> =
  | RootCoreCollection<T, TEntityReducers>
  | ContextualCoreCollection<T, TEntityReducers>;

export type PseudoCoreCollection<T extends ReducerMap, TProvider extends UseCaseProvider | null = UseCaseProvider> = [
  reducers: T,
  Provider: TProvider
];

export interface EntityGetter<T> {
  (): T;
}

export interface EntityWatchEvent<T, TValue = unknown> {
  fieldPaths: string[];

  newEntity: T;

  newValue: TValue;

  oldEntity: T;

  oldValue: TValue;
}

export interface EntityWatcher<T, TValue = unknown> {
  (event: EntityWatchEvent<T, TValue>): void;
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

export type UseCaseHookOptions<T, TUseCaseOptions extends object = object> = TUseCaseOptions &
  UseCaseHookOwnOptions<T, TUseCaseOptions>;

export interface ContextualCoreCollectionHook {
  <T, TEntityReducers extends EntityReducers<T>, TUseCaseOptions extends object = object>(
    usecase: EntityUseCase<T, TEntityReducers, TUseCaseOptions> &
      /**
       * 如果不使用 `&`，那么很多情况下 `options` 类型无法被正确推导；
       * 因为使用 `&` 是为了让该参数 `usecase` 的泛型 `T` 推导占优先级，
       * 从而保证 `options` 里的泛型 `T` 是根据 `usecase` 来推导的。
       */
      UseCase<EntityReducerMap<T>, TUseCaseOptions>,
    options?: UseCaseHookContextualOptions<T>
  ): ContextualCoreCollection<T, TEntityReducers>;
}

export interface RootCoreCollectionHook {
  <T, TEntityReducers extends EntityReducers<T>, TUseCaseOptions extends object = object>(
    entity: T | EntityGetter<T>,
    usecase: EntityUseCase<T, TEntityReducers, TUseCaseOptions> &
      /**
       * 如果不使用 `&`，那么很多情况下 `options` 类型无法被正确推导；
       * 因为使用 `&` 是为了让该参数 `usecase` 的泛型 `T` 推导占优先级，
       * 从而保证 `options` 里的泛型 `T` 是根据 `usecase` 来推导的。
       */
      UseCase<EntityReducerMap<T>, TUseCaseOptions>,
    options?: UseCaseHookOptions<T, TUseCaseOptions>,
    deps?: unknown[]
  ): RootCoreCollection<T, TEntityReducers>;
}

export interface ModeCoreCollectionHook {
  <T, TEntityReducers extends EntityReducers<T>, TUseCaseOptions extends object = object>(
    entity: T | EntityGetter<T>,
    usecase: EntityUseCase<T, TEntityReducers, TUseCaseOptions> &
      /**
       * 如果不使用 `&`，那么很多情况下 `options` 类型无法被正确推导；
       * 因为使用 `&` 是为了让该参数 `usecase` 的泛型 `T` 推导占优先级，
       * 从而保证 `options` 里的泛型 `T` 是根据 `usecase` 来推导的。
       */
      UseCase<EntityReducerMap<T>, TUseCaseOptions>,
    // 不能用可选，不然无法准确识别参数
    mode: UseCaseModes,
    options?: UseCaseHookOptions<T, TUseCaseOptions>,
    deps?: unknown[]
  ): RootCoreCollection<T, TEntityReducers>;
}

export interface PseudoCoreCollectionHook {
  <T extends Reducers, TUseCaseOptions extends object = object>(
    usecase: UseCase<T, TUseCaseOptions>,
    mode: UseCaseModes,
    options?: TUseCaseOptions,
    deps?: unknown[]
  ): PseudoCoreCollection<T>;
}

export interface ReducersHook {
  <T extends Reducers, TUseCaseOptions extends object = object>(
    usecase: UseCase<T, TUseCaseOptions>,
    options?: TUseCaseOptions,
    deps?: unknown[]
  ): T;
}

export interface CoreCollectionHook
  extends ContextualCoreCollectionHook,
    RootCoreCollectionHook,
    ModeCoreCollectionHook {}

export type UseCaseHookParameters =
  | Parameters<ContextualCoreCollectionHook>
  | Parameters<RootCoreCollectionHook>
  | Parameters<ModeCoreCollectionHook>
  | Parameters<PseudoCoreCollectionHook>
  | Parameters<ReducersHook>;

export interface UseCaseHook extends CoreCollectionHook, PseudoCoreCollectionHook, ReducersHook {}
