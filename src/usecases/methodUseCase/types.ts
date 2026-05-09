import { Reducers } from '@mic-rexjs/usecases';
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

export interface CaptureCallFactory {
  <T>(key: string, args: RestArguments): T;
}

export type MethodReducers = Reducers<{
  cacheCall<T extends CacheableFactory>(factory: T, options?: CacheCallOptions): T;

  cacheCalls<T extends Record<string, CacheableFactory>>(sourceFactories: T, options?: CacheCallOptions): T;

  captureCalls<T extends object>(obj: T, callback: CaptureCallFactory): T;
}>;
