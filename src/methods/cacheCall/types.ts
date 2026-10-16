import { RestArguments } from '@mic-rexjs/usecases/es/types';

export interface CacheableFactory {
  (...args: RestArguments): unknown;
}

export interface CacheCallOptions {
  onShouldCache?(): boolean;

  onCompare?(newArgs: RestArguments, oldArgs: RestArguments): boolean;
}

export interface CallCache<T extends CacheableFactory> {
  parameters: Parameters<T>;

  returnValue: ReturnType<T>;
}
