import { CompareCallback } from './types';
import { usePrevious } from 'ahooks';

export const useChanged = <T>(
  value: T,
  callback: CompareCallback<T> = (newValue: T, oldValue?: T): boolean => {
    return newValue !== oldValue;
  },
): boolean => {
  const prevValue = usePrevious(value, (): boolean => {
    /**
     * 这里一定要返回 `true`，不然 `value` 没有改变的话，那么 `prevValue` 也不会变，
     * 比如：首次 `value=1`,那么 `prevValue` 的值会一直是 `undefined`，
     * 就算组件刷新了无数次，它也是 `undefined`。
     *
     * 而我们期望的是：当组件第二次刷新，`prevValue` 应该是 `1`。
     */
    return true;
  });

  return callback(value, prevValue);
};
