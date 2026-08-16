import { EntityGenerator, EntityReducers } from '@mic-rexjs/usecases';
import React from 'react';
import { MatchPropertyFailedResult } from '@/entities/matchPropertyFailedResult/types';

export interface MatchPropertyFailedCallback<T> {
  (result: MatchPropertyFailedResult<T>): void;
}

export interface MatchValuePropertyFailedCallback<T> {
  <K extends keyof T>(key: K, newValue: T[K], oldValue: T[K]): void;
}

export type ValueReducers<T> = EntityReducers<
  T,
  {
    isObjectValue(entity: T): boolean;

    isValueChanged<S extends T>(entity: S, value: S): boolean;

    matchValue<S extends T>(entity: S, value: S, onMatchPropertyFailed?: MatchValuePropertyFailedCallback<S>): boolean;

    matchProperty<S extends T>(
      entity: S,
      value: S,
      fieldPath: string,
      onFailed?: MatchPropertyFailedCallback<S>,
    ): boolean;

    recordValue<S extends T>(entity: S, value: S): EntityGenerator<S, boolean>;

    recordValueMatch<S extends T>(entity: S, value: S): EntityGenerator<S, boolean>;

    recordValueMatchWith<S extends T>(entity: S, value: S, key?: React.Key): EntityGenerator<S, React.Key>;
  }
>;

export interface ValueUseCase {
  <T>(): ValueReducers<T>;
}
