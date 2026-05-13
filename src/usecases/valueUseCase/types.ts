import { EntityGenerator, EntityReducers } from '@mic-rexjs/usecases';
import React from 'react';
import { MatchPropertyFailedResult } from '@/entities/matchPropertyFailedResult/types';

export interface MatchPropertyFailedCallback<T> {
  (result: MatchPropertyFailedResult<T>): void;
}

export interface MatchValueFailedCallback<T> {
  <K extends keyof T>(key: K, newValue: T[K], oldValue: T[K]): void;
}

export type ValueReducers<T> = EntityReducers<
  T,
  {
    isValueChanged<S extends T>(entity: S, value: S): boolean;

    isValueMatched<S extends T>(entity: S, value: S, onMatchFailed?: MatchValueFailedCallback<S>): boolean;

    matchProperty<S extends T>(
      entity: S,
      value: S,
      fieldPath: string,
      onFailed?: MatchPropertyFailedCallback<S>,
    ): boolean;

    recordValue<S extends T>(entity: S, value: S): EntityGenerator<S, boolean>;

    recordValueDiff<S extends T>(entity: S, value: S): EntityGenerator<S, Partial<S>>;

    recordValueMatch<S extends T>(entity: S, value: S): EntityGenerator<S, boolean>;

    recordValueMatchWith<S extends T>(entity: S, value: S, key?: React.Key): EntityGenerator<S, React.Key>;
  }
>;

export interface ValueUseCase {
  <T>(): ValueReducers<T>;
}
