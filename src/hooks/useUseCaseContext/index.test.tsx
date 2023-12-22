import { describe, expect, test } from '@jest/globals';
import { renderHook } from '@testing-library/react';
import { useUseCaseContext } from '.';
import { ObjectReducers, objectUseCase } from '@mic-rexjs/usecases';
import { defaultUseCaseContext } from '@/configs/defaultUseCaseContext';
import { UseCaseContext } from '@/configs/defaultUseCaseContext/types';
import { usecaseContextReferenceMap } from '@/configs/useCaseContextReferenceMap';
import { UseCaseContextReference } from '@/configs/useCaseContextReferenceMap/types';

interface TestObject {
  x: number;
}

type TestReducers = ObjectReducers<TestObject>;

const testUseCase = (): TestReducers => {
  return objectUseCase();
};

describe('useUseCaseContext', (): void => {
  test('should return the default context if map has not save a usecase and provide a default context', (): void => {
    const defaultContext = defaultUseCaseContext as UseCaseContext<TestObject, TestReducers>;

    const { result } = renderHook((): UseCaseContext<TestObject, TestReducers> => {
      return useUseCaseContext(testUseCase, defaultContext);
    });

    const { current } = result;

    expect(current).toBe(defaultUseCaseContext);
  });

  test('should return a new context if map has not save a usecase and does not provide a default context', (): void => {
    const { result } = renderHook((): UseCaseContext<TestObject, TestReducers> => {
      return useUseCaseContext(testUseCase, null);
    });

    const { current } = result;

    expect(typeof current).toBe('object');
  });

  test.each([void 0, null, defaultUseCaseContext as UseCaseContext<TestObject, TestReducers>])(
    'should return the existing context if map has save a usecase already',
    (defaultContext?: UseCaseContext<TestObject, TestReducers> | null): void => {
      const { result } = renderHook((): boolean => {
        return useUseCaseContext(testUseCase) === useUseCaseContext(testUseCase, defaultContext);
      });

      const { current: isSame } = result;

      expect(isSame).toBe(true);
    }
  );

  test('check context reference times when mount/unmount a usecase', (): void => {
    const { unmount: unmount1 } = renderHook((): void => {
      useUseCaseContext(testUseCase);
    });

    const { times: times1 } = usecaseContextReferenceMap.get(testUseCase) as UseCaseContextReference<
      TestObject,
      TestReducers
    >;

    const { unmount: unmount2, rerender: rerender2 } = renderHook((): void => {
      useUseCaseContext(testUseCase);
      useUseCaseContext(testUseCase);
    });

    const { times: times2 } = usecaseContextReferenceMap.get(testUseCase) as UseCaseContextReference<
      TestObject,
      TestReducers
    >;

    expect(times1).toBe(1);
    expect(times2).toBe(3);

    unmount1();

    const { times: times3 } = usecaseContextReferenceMap.get(testUseCase) as UseCaseContextReference<
      TestObject,
      TestReducers
    >;

    expect(times3).toBe(2);

    unmount2();

    const hasSaved = usecaseContextReferenceMap.has(testUseCase);

    expect(hasSaved).toBe(false);
  });

  test('context reference times should not change when rerender hooks', (): void => {
    const { rerender } = renderHook((): void => {
      useUseCaseContext(testUseCase);
    });

    rerender();

    const { times } = usecaseContextReferenceMap.get(testUseCase) as UseCaseContextReference<TestObject, TestReducers>;

    expect(times).toBe(1);
  });
});
