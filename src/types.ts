import { AsyncEntityCallbackGenerator, EntityGenerator, RestArguments } from '@mic-rexjs/usecases/es/types';

export interface Dependencies extends RestArguments {}

export type InitEntityResult<T> = T | EntityGenerator<T> | AsyncEntityCallbackGenerator<T>;

export interface EntityInitializer<T> {
  (entity: T | undefined): InitEntityResult<T>;
}

export interface EntityLifeCycles<T> {
  bindEntity?<S extends T>(entity: S): S | void;

  unbindEntity?(entity: T): void;
}
