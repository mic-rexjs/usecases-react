import { Reducer } from '@mic-rexjs/usecases';
import { RestArguments } from '@mic-rexjs/usecases/es/types';

export interface CacheableFactory {
  (...args: RestArguments): unknown;
}

export interface CacheCallOptions {
  onShouldCache?(): boolean;

  onCompare?(newArgs: RestArguments, oldArgs: RestArguments): boolean;
}

export interface CallCache<T extends Reducer> {
  parameters: Parameters<T>;

  returnValue: ReturnType<T>;
}
