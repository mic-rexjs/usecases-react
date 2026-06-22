import { AsyncEntityCallbackGenerator, EntityGenerator, RestArguments } from '@mic-rexjs/usecases/es/types';

export interface Dependencies extends RestArguments {}

export type InitEntityResult<T> = T | EntityGenerator<T, void> | AsyncEntityCallbackGenerator<T, void>;

export interface EntityInitializer<T, TDependencies extends Dependencies = Dependencies> {
  (entity: T | undefined, changedDeps: Partial<TDependencies>): InitEntityResult<T>;
}
