import { IsEqualFailedCallback, MatchPropertyFailedCallback, ObjectUtilsReducers } from './types';
import { MatchPropertyFailedResult } from '@/entities/matchPropertyFailedResult/types';

export const objectUtilsUseCase = (): ObjectUtilsReducers => {
  const isObject = <T>(target: T): boolean => {
    if (typeof target !== 'object' || target === null) {
      return false;
    }

    return true;
  };

  const hasField = <T>(target: T, field: PropertyKey): boolean => {
    const isObj = isObject(target);

    if (isObj) {
      return Object.hasOwn(target as object, field);
    }

    return false;
  };

  const isEqual = <T>(target1: T, target2: T, onFailed?: IsEqualFailedCallback<T>): boolean => {
    if (target1 === target2) {
      return true;
    }

    const isObject1 = isObject(target1);
    const isObject2 = isObject(target2);
    const keys1 = isObject1 ? Object.keys(target1 as object) : [];
    const keys2 = isObject2 ? Object.keys(target2 as object) : [];
    const hasCallback = typeof onFailed === 'function';

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

      const hasField1 = hasField(target1, key);
      const hasField2 = hasField(target2, key);
      const value1 = hasField1 ? target1[key as keyof T] : void 0;
      const value2 = hasField2 ? target2[key as keyof T] : void 0;
      const matched = value1 === value2;

      if (hasField1 && hasField2 && matched) {
        continue;
      }

      allMatched = false;

      if (hasCallback) {
        onFailed(key as keyof T, value2 as T[keyof T], value1 as T[keyof T]);
        continue;
      }

      break;
    }

    return allMatched;
  };

  const matchProperty = <T>(
    target1: T,
    target2: T,
    fieldPath: string,
    onFailed?: MatchPropertyFailedCallback<T>,
  ): boolean => {
    let allMatched = true;
    let currentFieldPath = fieldPath;

    const list: MatchPropertyFailedResult<T>[] = [
      {
        fieldPaths: [],
        newEntity: target2,
        newValue: target2,
        oldEntity: target1,
        oldValue: target1,
      },
    ];

    do {
      const { oldValue, newValue, fieldPaths } = list.shift() as MatchPropertyFailedResult<T, T>;
      const [, key = currentFieldPath, subFieldPath = ''] = currentFieldPath.match(/^([^.]+)\.(.+)$/) || [];
      const hasOldField = hasField(oldValue, key);
      const hasNewField = hasField(newValue, key);

      if (hasOldField || hasNewField) {
        const [oldSubValue] = hasOldField ? [oldValue[key as keyof T]] : [];
        const [newSubValue] = hasNewField ? [newValue[key as keyof T]] : [];

        const result: MatchPropertyFailedResult<T> = {
          fieldPaths: [...fieldPaths, key],
          newEntity: target2,
          newValue: newSubValue,
          oldEntity: target1,
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
          newEntity: target2,
          newValue: newArray[i],
          oldEntity: target1,
          oldValue: oldArray[i],
        });
      }
    } while (list.length > 0);

    return allMatched;
  };

  return {
    hasField,
    isObject,
    isEqual,
    matchProperty,
  };
};
