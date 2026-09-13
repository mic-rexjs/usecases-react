import { Reducers } from '@mic-rexjs/usecases';
import { MatchPropertyFailedResult } from '@/entities/matchPropertyFailedResult/types';

export interface MatchPropertyFailedCallback<T> {
  (result: MatchPropertyFailedResult<T>): void;
}

export interface IsEqualFailedCallback<T> {
  <K extends keyof T>(key: K, newValue: T[K], oldValue: T[K]): void;
}

export type ObjectUtilsReducers = Reducers<{
  hasField<T>(target: T, field: PropertyKey): boolean;

  isObject<T>(target: T): boolean;

  isEqual<T>(target1: T, target2: T, onFailed?: IsEqualFailedCallback<T>): boolean;

  matchProperty<T>(entity: T, value: T, fieldPath: string, onFailed?: MatchPropertyFailedCallback<T>): boolean;
}>;
