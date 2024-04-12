import { RestArguments } from '@mic-rexjs/usecases/es/types';
import { CaptureCallFactory } from './types';

export const captureCalls = <T extends object>(obj: T, callback: CaptureCallFactory): T => {
  const newObj: Partial<T> = {};

  (Object.keys(obj) as (keyof T & string)[]).forEach((key: keyof T & string): void => {
    const value = obj[key];

    if (typeof value === 'function') {
      newObj[key] = (<TReturn>(...args: RestArguments): TReturn => {
        return callback(key, args);
      }) as T[keyof T & string];

      return;
    }

    newObj[key] = value;
  });

  return newObj as T;
};
