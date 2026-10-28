import { useContext } from '.';
import { describe, expect, test } from '@jest/globals';
import { Reducers } from '@mic-rexjs/usecases';
import { renderHook } from '@testing-library/react';
import { useContext as useReactContext } from 'react';
import { EntityUseCaseContextValue, UseCaseContext, UseCaseContextValue } from '@/usecases/contextUseCase/types';

type TestReducers = Reducers;

interface TestUseCaseContext extends UseCaseContext<EntityUseCaseContextValue<unknown, TestReducers>> {}

const testUseCase = (): TestReducers => {
  return {};
};

describe('useContext', (): void => {
  test('should return the default context with value `null` if map has not saved a usecase without entity root mode', (): void => {
    const { result } = renderHook((): UseCaseContextValue<TestReducers> | null => {
      const context = useContext(testUseCase, false);
      const value = useReactContext(context);

      return value;
    });

    const { current } = result;

    expect(current).toBe(null);
  });

  test('should return the default context with value `null` after unmount this hook', (): void => {
    const { result: result1, unmount: unmount1 } = renderHook((): UseCaseContextValue<TestReducers> | null => {
      const context = useContext(testUseCase, false);
      const value = useReactContext(context);

      return value;
    });

    const { current: current1 } = result1;

    expect(typeof current1).toBe('object');

    unmount1();

    const { result: result2 } = renderHook((): UseCaseContextValue<TestReducers> | null => {
      const context = useContext(testUseCase, false);
      const value = useReactContext(context);

      return value;
    });

    const { current: current2 } = result2;

    expect(current2).toBe(null);
  });

  test('should return a new context if map has not saved a usecase with entity root mode', (): void => {
    const { result } = renderHook((): TestUseCaseContext => {
      return useContext(testUseCase, true);
    });

    const { current } = result;

    expect(typeof current).toBe('object');
  });
});
