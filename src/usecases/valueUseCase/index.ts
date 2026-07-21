import { MatchPropertyFailedCallback, MatchValueFailedCallback, ValueReducers, ValueUseCase } from './types';
import { createUseCase, EntityGenerator, entityUseCase, utilsUseCase } from '@mic-rexjs/usecases';
import { MatchPropertyFailedResult } from '@/entities/matchPropertyFailedResult/types';

export const valueUseCase = createUseCase((): ValueUseCase => {
  return <T>(): ValueReducers<T> => {
    const entityReducers = entityUseCase();
    const { createKey } = utilsUseCase();
    let prevKeyIndex: React.Key = createKey();

    const hasField = (entity: T, field: PropertyKey): boolean => {
      if (typeof entity !== 'object' || entity === null) {
        return false;
      }

      return Object.hasOwn(entity, field);
    };

    const isValueChanged = <S extends T>(entity: S, value: S): boolean => {
      return entity !== value;
    };

    const isValueMatched = <S extends T>(entity: S, value: S, onMatchFailed?: MatchValueFailedCallback<S>): boolean => {
      if (entity === value) {
        return true;
      }

      const isObject1 = typeof entity === 'object' && entity !== null;
      const isObject2 = typeof value === 'object' && value !== null;

      if (!isObject1 || !isObject2) {
        return false;
      }

      let allMatched = true;
      const keys1 = Object.keys(entity);
      const keys2 = Object.keys(value);
      const { length: length1 } = keys1;
      const keys = [...keys1, ...keys2];
      const hasCallback = typeof onMatchFailed === 'function';

      for (let i = 0, { length } = keys; i < length; i++) {
        const key = keys[i];
        const isFromKeys2 = i >= length1;
        const isInKey1 = keys1.includes(key);
        const isUsed = isFromKeys2 && isInKey1;

        if (isUsed) {
          continue;
        }

        const hasField1 = Object.hasOwn(entity, key);
        const hasField2 = Object.hasOwn(value, key);
        const onlyHasField1 = hasField1 && !hasField2;
        const onlyHasField2 = !hasField1 && hasField2;
        const onlyHasOneField = onlyHasField1 || onlyHasField2;
        const value1 = entity[key as keyof S];
        const value2 = value[key as keyof S];
        const matched = value1 === value2;

        if (!onlyHasOneField && matched) {
          continue;
        }

        allMatched = false;

        if (hasCallback) {
          onMatchFailed(key as keyof S, value2, value1);
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
        const { oldValue, newValue, fieldPaths } = list.shift() as MatchPropertyFailedResult<S>;
        const [, key = currentFieldPath, subFieldPath = ''] = currentFieldPath.match(/^([^.]+)\.(.+)$/) || [];
        const hasOldField = hasField(oldValue as S, key);
        const hasNewField = hasField(newValue as S, key);

        if (hasOldField || hasNewField) {
          const oldFieldDescriptor = Object.getOwnPropertyDescriptor(hasOldField ? oldValue : {}, key) || {};
          const newFieldDescriptor = Object.getOwnPropertyDescriptor(hasNewField ? newValue : {}, key) || {};
          const { value: oldSubValue, get: oldFieldGet, set: oldFieldSet } = oldFieldDescriptor;
          const { value: newSubValue, get: newFieldGet, set: newFieldSet } = newFieldDescriptor;

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

          const hasOldFieldGet = typeof oldFieldGet === 'function';
          const hasOldFieldSet = typeof oldFieldSet === 'function';
          const hasNewFieldGet = typeof newFieldGet === 'function';
          const hasNewFieldSet = typeof newFieldSet === 'function';
          const hasOldFieldAccessor = hasOldFieldGet || hasOldFieldSet;
          const hasNewFieldAccessor = hasNewFieldGet || hasNewFieldSet;

          // 如果都是访问器
          if (hasOldFieldAccessor && hasNewFieldAccessor) {
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

    const recordValueDiff = function* <S extends T>(entity: S, value: S): EntityGenerator<S, Partial<S>> {
      const isArray1 = Array.isArray(entity);
      const isArray2 = Array.isArray(value);
      const isArray = isArray1 && isArray2;
      const result = (isArray ? [] : {}) as Partial<S>;

      if (isArray) {
        const { length: length1 } = entity;
        const { length: length2 } = value;

        (result as typeof entity).length = Math.max(length1, length2);
      }

      const matched = isValueMatched(entity, value, <K extends keyof S>(key: K, newValue: S[K]): void => {
        result[key] = newValue;
      });

      if (!matched) {
        yield value;
      }

      return result;
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
      isValueChanged,
      isValueMatched,
      matchProperty,
      recordValue,
      recordValueDiff,
      recordValueMatch,
      recordValueMatchWith,
    };
  };
});
