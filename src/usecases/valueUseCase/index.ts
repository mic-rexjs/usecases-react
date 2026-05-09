import { MatchPropertyFailedCallback, ValueReducers, ValueUseCase } from './types';
import { createUseCase, EntityGenerator, entityUseCase } from '@mic-rexjs/usecases';
import { MatchPropertyFailedResult } from '@/entities/matchPropertyFailedResult/types';

export const valueUseCase = createUseCase((): ValueUseCase => {
  let keyIndex = 0;

  return <T>(): ValueReducers<T> => {
    let prevKeyIndex = keyIndex++;
    const entityReducers = entityUseCase();

    const hasField = (entity: T, field: string): boolean => {
      if (typeof entity !== 'object' || entity === null) {
        return false;
      }

      return Object.hasOwn(entity, field);
    };

    const isValueChanged = <S extends T>(entity: S, value: S): boolean => {
      return entity !== value;
    };

    const isValueMatched = <S extends T>(entity: S, value: S): boolean => {
      if (entity === value) {
        return true;
      }

      const isObject1 = typeof entity === 'object' && entity !== null;
      const isObject2 = typeof value === 'object' && value !== null;

      if (!isObject1 || !isObject2) {
        return false;
      }

      const keys1 = Object.keys(entity);
      const keys2 = Object.keys(value);
      const { length: length1 } = keys1;
      const { length: length2 } = keys2;

      if (length1 !== length2) {
        return false;
      }

      for (const key of keys1) {
        const value1 = entity[key as keyof T];
        const value2 = value[key as keyof T];

        if (value1 === value2) {
          continue;
        }

        return false;
      }

      return true;
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
        const { oldValue, newValue, fieldPaths } = list.shift() as MatchPropertyFailedResult<S>;
        const [, key = currentFieldPath, subFieldPath = ''] = currentFieldPath.match(/^([^.]+)\.(.+)$/) || [];
        const hasOldField = hasField(oldValue as S, key);
        const hasNewField = hasField(newValue as S, key);

        if (hasOldField || hasNewField) {
          const subOldValue = hasOldField ? (oldValue as S)[key as keyof S] : void 0;
          const subNewValue = hasNewField ? (newValue as S)[key as keyof S] : void 0;

          const result: MatchPropertyFailedResult<S> = {
            fieldPaths: [...fieldPaths, key],
            newEntity: value,
            newValue: subNewValue,
            oldEntity: entity,
            oldValue: subOldValue,
          };

          if (subFieldPath) {
            currentFieldPath = subFieldPath;

            list.push(result);
            continue;
          }

          if (subOldValue === subNewValue) {
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
      const matched = isValueMatched(entity, value);

      if (matched) {
        return true;
      }

      yield value;
      return false;
    };

    const recordValueMatchWith = function* <S extends T>(
      entity: S,
      value: S,
      key = keyIndex + 1,
    ): EntityGenerator<S, number> {
      const matched = yield* recordValueMatch(entity, value);

      if (!matched) {
        // 不管是不是使用 `keyIndex` 生成的 `key`，都自增一次，如果是，则可以保持一致
        keyIndex++;
        prevKeyIndex = key;
      }

      return prevKeyIndex;
    };

    return {
      ...entityReducers,
      isValueChanged,
      isValueMatched,
      matchProperty,
      recordValue,
      recordValueMatch,
      recordValueMatchWith,
    };
  };
});
