import { Reducers } from '@mic-rexjs/usecases';
import { ReducerCallCache, ReducerCallCacheMap, ShouldCacheReducerCallback } from './types';
import { isSameArray } from '../isSameArray';

export const cacheReducerCalls = <T extends Reducers>(reducers: T, shouldCache: ShouldCacheReducerCallback): T => {
  const cacheMap: ReducerCallCacheMap<T> = {};
  const newReducers: Partial<T> = {};

  for (const [key, reducer] of Object.entries(reducers)) {
    newReducers[key as keyof T] = (<TArg, TReturn>(...args: TArg[]): TReturn => {
      const cache = cacheMap[key];
      const cacheable = shouldCache();

      if (cache && cacheable) {
        const { parameters, returnValue } = cache;

        if (isSameArray(parameters, args)) {
          return returnValue as TReturn;
        }
      }

      const returnValue = (reducer as (...args: TArg[]) => TReturn)(...args);

      if (cacheable) {
        cacheMap[key as keyof T] = {
          parameters: args,
          returnValue,
        } as ReducerCallCache<T[keyof T]>;
      }

      return returnValue;
    }) as T[keyof T];
  }

  return newReducers as T;
};
