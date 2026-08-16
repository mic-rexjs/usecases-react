import { MatchPropertyFailedCallback, MatchValuePropertyFailedCallback, ValueReducers, ValueUseCase } from './types';
import { createUseCase, EntityGenerator, entityUseCase, utilsUseCase } from '@mic-rexjs/usecases';
import { MatchPropertyFailedResult } from '@/entities/matchPropertyFailedResult/types';

export const valueUseCase = createUseCase((): ValueUseCase => {
  return <T>(): ValueReducers<T> => {
    const entityReducers = entityUseCase();
    const { createKey } = utilsUseCase();
    let prevKeyIndex: React.Key = createKey();

    const isObjectValue = (entity: T): boolean => {
      if (typeof entity !== 'object' || entity === null) {
        return false;
      }

      return true;
    };

    const hasField = (entity: T, field: PropertyKey): boolean => {
      const isObject = isObjectValue(entity);

      if (isObject) {
        return Object.hasOwn(entity as object, field);
      }

      return false;
    };

    const isValueChanged = <S extends T>(entity: S, value: S): boolean => {
      return entity !== value;
    };

    const matchValue = <S extends T>(
      entity: S,
      value: S,
      onMatchPropertyFailed?: MatchValuePropertyFailedCallback<S>,
    ): boolean => {
      if (entity === value) {
        return true;
      }

      const isObject1 = isObjectValue(entity);
      const isObject2 = isObjectValue(value);
      const keys1 = isObject1 ? Object.keys(entity as object) : [];
      const keys2 = isObject2 ? Object.keys(value as object) : [];
      const hasCallback = typeof onMatchPropertyFailed === 'function';

      if (!isObject1 && !isObject2) {
        return false;
      }

      let allMatched = true;
      const { length: length1 } = keys1;
      const keys = [...keys1, ...keys2];

      for (let i = 0, { length } = keys; i < length; i++) {
        const key = keys[i];
        const isInKey1 = keys1.includes(key);
        const isFromKeys2 = i >= length1;
        const isUsed = isFromKeys2 && isInKey1;

        if (isUsed) {
          continue;
        }

        const hasField1 = hasField(entity, key);
        const hasField2 = hasField(value, key);
        const value1 = hasField1 ? entity[key as keyof S] : void 0;
        const value2 = hasField2 ? value[key as keyof S] : void 0;
        const matched = value1 === value2;

        if (hasField1 && hasField2 && matched) {
          continue;
        }

        allMatched = false;

        if (hasCallback) {
          onMatchPropertyFailed(key as keyof S, value2 as S[keyof S], value1 as S[keyof S]);
          continue;
        }

        break;
      }

      return allMatched;
    };

    const matchProperty = <S extends T>(
      entity: S,
      value: S,
      fieldPath: string,
      onFailed?: MatchPropertyFailedCallback<S>,
    ): boolean => {
      let allMatched = true;
      let currentFieldPath = fieldPath;

      const list: MatchPropertyFailedResult<S>[] = [
        {
          fieldPaths: [],
          newEntity: value,
          newValue: value,
          oldEntity: entity,
          oldValue: entity,
        },
      ];

      do {
        const { oldValue, newValue, fieldPaths } = list.shift() as MatchPropertyFailedResult<S, S>;
        const [, key = currentFieldPath, subFieldPath = ''] = currentFieldPath.match(/^([^.]+)\.(.+)$/) || [];
        const hasOldField = hasField(oldValue, key);
        const hasNewField = hasField(newValue, key);

        if (hasOldField || hasNewField) {
          const [oldSubValue] = hasOldField ? [oldValue[key as keyof S]] : [];
          const [newSubValue] = hasNewField ? [newValue[key as keyof S]] : [];

          const result: MatchPropertyFailedResult<S> = {
            fieldPaths: [...fieldPaths, key],
            newEntity: value,
            newValue: newSubValue,
            oldEntity: entity,
            oldValue: oldSubValue,
          };

          if (subFieldPath) {
            currentFieldPath = subFieldPath;

            list.push(result);
            continue;
          }

          if (newSubValue === oldSubValue) {
            continue;
          }

          allMatched = false;
          onFailed?.(result);
          continue;
        }

        if (/^\d+^/.test(key)) {
          continue;
        }

        const oldArray = Array.isArray(oldValue) ? oldValue : [];
        const newArray = Array.isArray(newValue) ? newValue : [];
        const { length: oldLength } = oldArray;
        const { length: newLength } = newArray;
        const length = Math.max(oldLength, newLength);

        for (let i = 0; i < length; i++) {
          list.push({
            fieldPaths: [...fieldPaths, `${i}`],
            newEntity: value,
            newValue: newArray[i],
            oldEntity: entity,
            oldValue: oldArray[i],
          });
        }
      } while (list.length > 0);

      return allMatched;
    };

    const recordValue = function* <S extends T>(entity: S, value: S): EntityGenerator<S, boolean> {
      const changed = isValueChanged(entity, value);

      if (!changed) {
        return false;
      }

      yield value;
      return true;
    };

    const recordValueMatch = function* <S extends T>(entity: S, value: S): EntityGenerator<S, boolean> {
      const matched = matchValue(entity, value);

      if (matched) {
        return true;
      }

      yield value;
      return false;
    };

    const recordValueMatchWith = function* <S extends T>(
      entity: S,
      value: S,
      key?: React.Key,
    ): EntityGenerator<S, React.Key> {
      const matched = yield* recordValueMatch(entity, value);

      if (!matched) {
        prevKeyIndex = key ?? createKey();
      }

      return prevKeyIndex;
    };

    return {
      ...entityReducers,
      isObjectValue,
      isValueChanged,
      matchValue,
      matchProperty,
      recordValue,
      recordValueMatch,
      recordValueMatchWith,
    };
  };
});
