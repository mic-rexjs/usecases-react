import { CacheableFactory, CacheCallOptions, CallCache } from './types';
import { RestArguments } from '@mic-rexjs/usecases/es/types';
import { objectUtilsUseCase } from '@/usecases/objectUtilsUseCase';

export const cacheCall = <T extends CacheableFactory>(factory: T, options?: CacheCallOptions): T => {
  let cache: CallCache<T>;
  const { isEqual } = objectUtilsUseCase();

  const {
    onShouldCache = (): boolean => {
      return true;
    },
    onCompare = <TArgs extends Parameters<T>>(newArgs: TArgs, oldArgs: TArgs): boolean => {
      return isEqual(newArgs, oldArgs);
    },
  } = options || {};

  return new Proxy(factory, {
    apply<TThis>(target: T, thisArg: TThis, argList: RestArguments = []): ReturnType<T> {
      const args = argList as Parameters<T>;
      const cacheable = onShouldCache();

      if (cache && cacheable) {
        const { parameters, returnValue } = cache;

        if (onCompare(parameters, args as Parameters<T>)) {
          return returnValue;
        }
      }

      const returnValue = Reflect.apply(target, thisArg, args as Parameters<T>);

      if (cacheable) {
        cache = {
          parameters: args,
          returnValue,
        };
      }

      return returnValue;
    },
  });
};
