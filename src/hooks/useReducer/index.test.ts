import { describe, expect, jest, test } from '@jest/globals';
import { act, renderHook } from '@testing-library/react';
import { useReducer } from '.';

describe('useReducer', (): void => {
  test('should call the reducer function with correct arguments and return value', (): void => {
    const add = jest.fn((num1: number, num2: number): number => {
      return num1 + num2;
    });

    const { result } = renderHook((): ((num1: number, num2: number) => number) => {
      return useReducer(add);
    });

    const { current: reducer } = result;
    const resultValue = reducer(2, 3);

    expect(add).toHaveBeenCalledWith(2, 3);
    expect(resultValue).toEqual(5);
  });

  test('should cache the return value if the reducer and parameters have not change', (): void => {
    const add = jest.fn((num1: number, num2: number): number => {
      return num1 + num2;
    });

    const { result, rerender } = renderHook((): ((num1: number, num2: number) => number) => {
      return useReducer(add);
    });

    const { current: reducer } = result;

    expect(add).toHaveBeenCalledTimes(0);
    expect(reducer(2, 3)).toBe(5);
    expect(add).toHaveBeenCalledTimes(1);
    expect(reducer(2, 3)).toBe(5);
    expect(reducer(2, 3)).toBe(5);
    expect(add).toHaveBeenCalledTimes(1);

    rerender();

    expect(reducer(2, 3)).toBe(5);
    expect(add).toHaveBeenCalledTimes(1);

    act((): void => {
      reducer(2, 3);
    });

    expect(add).toHaveBeenCalledTimes(1);
  });

  test('should not cache the return value if the reducer has changed', (): void => {
    const add1 = jest.fn((num1: number, num2: number): number => {
      return num1 + num2;
    });

    const add2 = jest.fn((num1: number, num2: number): number => {
      return num1 + num2;
    });

    let addReducer = add1;

    const { result, rerender } = renderHook((): ((num1: number, num2: number) => number) => {
      return useReducer(addReducer);
    });

    const { current: reducer } = result;

    expect(add1).toHaveBeenCalledTimes(0);
    expect(reducer(2, 3)).toBe(5);
    expect(add1).toHaveBeenCalledTimes(1);

    addReducer = add2;

    rerender();

    expect(reducer(2, 3)).toBe(5);
    expect(add1).toHaveBeenCalledTimes(1);
    expect(add2).toHaveBeenCalledTimes(1);
    expect(add2).toHaveBeenLastCalledWith(2, 3);
    expect(reducer(2, 3)).toBe(5);
    expect(add2).toHaveBeenCalledTimes(1);
  });

  test('should not cache the return value if parameters have changed', (): void => {
    const add = jest.fn((num1: number, num2: number): number => {
      return num1 + num2;
    });

    const { result } = renderHook((): ((num1: number, num2: number) => number) => {
      return useReducer(add);
    });

    const { current: reducer } = result;

    expect(add).toHaveBeenCalledTimes(0);
    expect(reducer(2, 3)).toBe(5);
    expect(add).toHaveBeenCalledTimes(1);
    expect(reducer(3, 3)).toBe(6);
    expect(add).toHaveBeenCalledTimes(2);
    expect(reducer(3, 3)).toBe(6);
    expect(add).toHaveBeenCalledTimes(2);
    expect(reducer(3, 5)).toBe(8);
    expect(add).toHaveBeenCalledTimes(3);
  });

  test('should trigger the newest reducer if parameters have changed', (): void => {
    const add1 = jest.fn((num1: number, num2: number): number => {
      return num1 + num2;
    });

    const add2 = jest.fn((num1: number, num2: number): number => {
      return num1 + num2;
    });

    let addReducer = add1;

    const { result, rerender } = renderHook((): ((num1: number, num2: number) => number) => {
      return useReducer(addReducer);
    });

    const { current: reducer } = result;

    expect(add1).toHaveBeenCalledTimes(0);
    expect(reducer(2, 3)).toBe(5);
    expect(add1).toHaveBeenCalledTimes(1);

    addReducer = add2;
    rerender();

    expect(reducer(3, 3)).toBe(6);
    expect(add1).toHaveBeenCalledTimes(1);
    expect(add2).toHaveBeenCalledTimes(1);
    expect(add2).toHaveBeenCalledWith(3, 3);
  });
});
