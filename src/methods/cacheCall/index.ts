import { isSameArray } from '../isSameArray';
import { CallCache, CacheableFactory, CacheCallOptions } from './types';

export const cacheCall = <T extends CacheableFactory>(factory: T, options?: CacheCallOptions): T => {
  let cache: CallCache<T>;

  const {
    onShouldCache = (): boolean => {
      return true;
    },
    onCompare = <TArgs extends Parameters<T>>(newArgs: TArgs, oldArgs: TArgs): boolean => {
      return isSameArray(newArgs, oldArgs);
    },
  } = options || {};

  return ((...args: Parameters<T>): ReturnType<T> => {
    const cacheable = onShouldCache();

    if (cache && cacheable) {
      const { parameters, returnValue } = cache;

      if (onCompare(parameters, args)) {
        return returnValue;
      }
    }

    const returnValue = factory(...args) as ReturnType<T>;

    if (cacheable) {
      cache = {
        parameters: args,
        returnValue,
      };
    }

    return returnValue;
  }) as T;
};
