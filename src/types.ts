import { AsyncEntityCallbackGenerator, EntityGenerator, RestArguments } from '@mic-rexjs/usecases/es/types';

export interface Dependencies extends RestArguments {}

export type InitEntityResult<T> = T | EntityGenerator<T, void> | AsyncEntityCallbackGenerator<T, void>;

export interface EntityInitializer<T, TDependencies extends Dependencies = Dependencies> {
  (entity: T | undefined, changedDeps: Partial<TDependencies>): InitEntityResult<T>;
}

export interface EntityLifeCycles<T> {
  bindEntity?<S extends T>(entity: S): S | void;

  unbindEntity?(entity: T): void;
}
