import { ContextualEntityReducers } from '@/configs/defaultUseCaseContext/types';
import { EntityReducers, EntityUseCase, Reducers, UseCase } from '@mic-rexjs/usecases';
import { UseCaseProvider } from '../useProvider/types';

export type CoreCollection<
  T,
  TEntityReducers extends EntityReducers<T>,
  TProvide extends UseCaseProvider | null = UseCaseProvider
> = [entity: T, reducers: ContextualEntityReducers<T, TEntityReducers>, Provider: TProvide];

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
  stateless?: boolean;

  options?: TUseCaseOptions;
}

export type UseCaseHookOptions<T, TUseCaseOptions extends object = object> = TUseCaseOptions &
  UseCaseHookOwnOptions<T, TUseCaseOptions>;

export interface UseCaseHook {
  <T, TEntityReducers extends EntityReducers<T>>(
    usecase: EntityUseCase<T, TEntityReducers> &
      /**
       * 如果不使用 `&`，那么很多情况下 `options` 类型无法被正确推导；
       * 因为使用 `&` 是为了让该参数 `usecase` 的泛型 `T` 推导占优先级，
       * 从而保证 `options` 里的泛型 `T` 是根据 `usecase` 来推导的。
       */
      UseCase<EntityReducers<T>>,
    options?: UseCaseHookContextualOptions<T>
  ): CoreCollection<T, TEntityReducers, null>;

  <T, TEntityReducers extends EntityReducers<T>, TUseCaseOptions extends object = object>(
    initailEntity: T | EntityGetter<T>,
    usecase: EntityUseCase<T, TEntityReducers, TUseCaseOptions> &
      /**
       * 1. 如果不使用 `&`，那么很多情况下 `options` 类型无法被正确推导；
       * 因为使用 `&` 是为了让该参数 `usecase` 的泛型 `T` 推导占优先级，
       * 从而保证 `options` 里的泛型 `T` 是根据 `usecase` 来推导的。
       *
       * 2. 以 `TEntityReducers` 代替了 `EntityReducers<T>`，
       * 因为如果使用 `EntityReducers<T>` 则会导致其推导优先级比 `initailEntity` 还高，
       * 这是不应该的，所以要使用不带泛型参数的 `TEntityReducers`。
       *
       * 推导权重等级应该是：`initailEntity` > `usecase` > `options`，
       * 即：以 `initailEntity` 中的泛型 `T` 为准。
       */
      UseCase<TEntityReducers, TUseCaseOptions>,
    options?: UseCaseHookOptions<T, TUseCaseOptions>,
    deps?: unknown[]
  ): CoreCollection<T, TEntityReducers>;

  <T extends Reducers, TUseCaseOptions extends object = object>(
    usecase: UseCase<T, TUseCaseOptions>,
    options?: TUseCaseOptions,
    deps?: unknown[]
  ): T;
}
