import { valueUseCase } from '../valueUseCase';
import { CacheableFactory, CacheCallOptions, CallCache, CaptureCallFactory, MethodReducers } from './types';
import { RestArguments } from '@mic-rexjs/usecases/es/types';

export const methodUseCase = (): MethodReducers => {
  const { isValueMatched } = valueUseCase();

  const cacheCall = <T extends CacheableFactory>(factory: T, options?: CacheCallOptions): T => {
    let cache: CallCache<T>;

    const {
      onShouldCache = (): boolean => {
        return true;
      },
      onCompare = <TArgs extends Parameters<T>>(newArgs: TArgs, oldArgs: TArgs): boolean => {
        return isValueMatched(newArgs, oldArgs);
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

  const cacheCalls = <T extends Record<string, CacheableFactory>>(
    sourceFactories: T,
    options?: CacheCallOptions,
  ): T => {
    const cachedFactories: Partial<T> = {};

    Object.entries(sourceFactories).forEach(<K extends keyof T>([key, factory]: [K, CacheableFactory]): void => {
      cachedFactories[key] = cacheCall(factory, options) as T[K];
    });

    return cachedFactories as T;
  };

  const captureCalls = <T extends object>(obj: T, callback: CaptureCallFactory): T => {
    const newObj: Partial<T> = {};

    (Object.keys(obj) as (keyof T & string)[]).forEach((key: keyof T & string): void => {
      const value = obj[key];

      if (typeof value === 'function') {
        newObj[key] = (<TReturn>(...args: RestArguments): TReturn => {
          return callback(key, args);
        }) as T[keyof T & string];

        return;
      }

      newObj[key] = value;
    });

    return newObj as T;
  };

  return {
    cacheCall,
    cacheCalls,
    captureCalls,
  };
};
