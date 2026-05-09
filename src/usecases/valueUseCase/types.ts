import { EntityGenerator, EntityReducers } from '@mic-rexjs/usecases';
import { MatchPropertyFailedResult } from '@/entities/matchPropertyFailedResult/types';

export interface MatchPropertyFailedCallback<T> {
  (result: MatchPropertyFailedResult<T>): void;
}

export type ValueReducers<T> = EntityReducers<
  T,
  {
    isValueChanged<S extends T>(entity: S, value: S): boolean;

    isValueMatched<S extends T>(entity: S, value: S): boolean;

    matchProperty<S extends T>(
      entity: S,
      value: S,
      fieldPath: string,
      onFailed?: MatchPropertyFailedCallback<S>,
    ): boolean;

    recordValue<S extends T>(entity: S, value: S): EntityGenerator<S, boolean>;

    recordValueMatch<S extends T>(entity: S, value: S): EntityGenerator<S, boolean>;

    recordValueMatchWith<S extends T>(entity: S, value: S, key?: number): EntityGenerator<S, number>;
  }
>;

export interface ValueUseCase {
  <T>(): ValueReducers<T>;
}
