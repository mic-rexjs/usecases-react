import { Reducer, ReducerMap } from '@mic-rexjs/usecases';

export interface ReducerCallCache<T extends Reducer> {
  parameters: Parameters<T>;

  returnValue: ReturnType<T>;
}

export interface ShouldCacheReducerCallback {
  (): boolean;
}

export type ReducerCallCacheMap<T extends ReducerMap> = {
  [K in keyof T]?: ReducerCallCache<T[K]>;
};
