import { describe, expect, test } from '@jest/globals';
import { renderHook } from '@testing-library/react';
import { useContext } from '.';
import { Reducers } from '@mic-rexjs/usecases';
import { ArgumentTypes } from '@/enums/ArgumentTypes';
import { Context, ContextValue } from '@/usecases/contextUseCase/types';
import { useContext as useReactContext } from 'react';

type TestReducers = Reducers;

interface TestUseCaseContext extends Context<ContextValue<TestReducers>> {}

const testUseCase = (): TestReducers => {
  return {};
};

describe('useContext', (): void => {
  test('should return the default context with value `null` if map has not saved a usecase with default args', (): void => {
    const { result } = renderHook((): ContextValue<TestReducers> | null => {
      const context = useContext(testUseCase);
      const value = useReactContext(context);

      return value;
    });

    const { current } = result;

    expect(current).toBe(null);
  });

  test('should return the default context with value `null` if map has not saved a usecase with `ArgumentTypes.None` & `UseCaseModes.Normal`', (): void => {
    const { result } = renderHook((): ContextValue<TestReducers> | null => {
      const context = useContext(testUseCase, ArgumentTypes.None);
      const value = useReactContext(context);

      return value;
    });

    const { current } = result;

    expect(current).toBe(null);
  });

  test('should return the default context with value `null` as unmount this hook', (): void => {
    const { result: result1, unmount: unmount1 } = renderHook((): ContextValue<TestReducers> | null => {
      const context = useContext(testUseCase, ArgumentTypes.None);
      const value = useReactContext(context);

      return value;
    });

    const { current: current1 } = result1;

    expect(typeof current1).toBe('object');

    unmount1();

    const { result: result2 } = renderHook((): ContextValue<TestReducers> | null => {
      const context = useContext(testUseCase, ArgumentTypes.None);
      const value = useReactContext(context);

      return value;
    });

    const { current: current2 } = result2;

    expect(current2).toBe(null);
  });

  test('should return a new context if map has not saved a usecase with `ArgumentTypes.Entity` & `UseCaseModes.Normal`', (): void => {
    const { result } = renderHook((): TestUseCaseContext => {
      return useContext(testUseCase, ArgumentTypes.Entity);
    });

    const { current } = result;

    expect(typeof current).toBe('object');
  });
});
