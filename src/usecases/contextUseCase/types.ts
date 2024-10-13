import { Reducers } from '@mic-rexjs/usecases';

export type ContextReducers = Reducers<{
  hasContext<T>(target: T): boolean;
}>;
