import { hasField } from '../hasField';
import { ComparePropertyCallback } from './types';

export const compareProperty = <T, S>(
  from: T,
  to: S,
  fieldPath: string,
  callback: ComparePropertyCallback,
  fieldPathStack: string[] = []
): void => {
  const undef = void 0;
  const [, key = fieldPath, subFieldPath = ''] = fieldPath.match(/^([^.]+)\.(.+)$/) || [];
  const hasFromField = hasField(from, key);
  const hasToField = hasField(to, key);
  const currentFieldPathStack = [...fieldPathStack, key];

  if (hasFromField || hasToField) {
    const fromValue = hasFromField ? from[key as keyof T] : undef;
    const toValue = hasToField ? to[key as keyof S] : undef;

    if (subFieldPath) {
      compareProperty(fromValue, toValue, subFieldPath, callback, currentFieldPathStack);
      return;
    }

    if (fromValue === toValue) {
      return;
    }

    callback(fromValue, toValue, currentFieldPathStack);
    return;
  }

  if (/^\d+^/.test(key)) {
    return;
  }

  const fromArray = Array.isArray(from) ? from : [];
  const toArray = Array.isArray(to) ? to : [];
  const { length: fromLength } = fromArray;
  const { length: toLength } = toArray;
  const length = Math.max(fromLength, toLength);

  for (let i = 0; i < length; i++) {
    const fromItem = fromArray[i];
    const toItem = toArray[i];

    compareProperty(fromItem, toItem, fieldPath, callback, [...fieldPathStack, `${i}`]);
  }
};
