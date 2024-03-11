import { CacheCallOptions, CacheableFactory } from '../cacheCall/types';
import { cacheCall } from '../cacheCall';

export const cacheCalls = <T extends Record<string, CacheableFactory>>(
  sourceFactories: T,
  options?: CacheCallOptions,
): T => {
  const cachedFactories: Partial<T> = {};

  Object.entries(sourceFactories).forEach(<K extends keyof T>([key, factory]: [K, CacheableFactory]): void => {
    cachedFactories[key] = cacheCall(factory, options) as T[K];
  });

  return cachedFactories as T;
};
