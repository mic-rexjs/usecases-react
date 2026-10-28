import {
  AsyncEntityCallbackGenerator,
  EntityGenerator,
  EntityReducerMap,
  ReducerMap,
  RestArguments,
} from '@mic-rexjs/usecases/es/types';

export interface Dependencies extends RestArguments {}

export type UnknownReducerMap<T> = ReducerMap | EntityReducerMap<T>;

export type InitEntityResult<T> = T | EntityGenerator<T> | AsyncEntityCallbackGenerator<T>;

export interface EntityInitializer<T> {
  (entity: T | undefined): InitEntityResult<T>;
}
