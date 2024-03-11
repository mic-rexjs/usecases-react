import { describe, expect, test } from '@jest/globals';
import { renderHook } from '@testing-library/react';
import { useUseCaseContext } from '.';
import { Reducers } from '@mic-rexjs/usecases';
import { defaultUseCaseContext } from '@/configs/defaultUseCaseContext';
import { UseCaseContext, UseCaseContextValue } from '@/configs/defaultUseCaseContext/types';
import { usecaseContextReferenceMap } from '@/configs/useCaseContextReferenceMap';
import { UseCaseContextReference } from '@/configs/useCaseContextReferenceMap/types';
import { UseCaseModes } from '@/enums/UseCaseModes';
import { UseCaseArgumentTypes } from '@/enums/UseCaseArgumentTypes';

type TestReducers = Reducers;

interface TestUseCaseContext extends UseCaseContext<UseCaseContextValue<TestReducers>> {}

interface TestUseCaseContextReference extends UseCaseContextReference<UseCaseContextValue<TestReducers>> {}

const testUseCase = (): TestReducers => {
  return {};
};

describe('useUseCaseContext', (): void => {
  test('should return the default context if map has not saved a usecase with default args', (): void => {
    const { result } = renderHook((): TestUseCaseContext => {
      return useUseCaseContext(testUseCase);
    });

    const { current } = result;

    expect(current).toBe(defaultUseCaseContext);
  });

  test('should return the default context if map has not saved a usecase with `UseCaseArgumentTypes.None` & `UseCaseModes.Normal`', (): void => {
    const { result } = renderHook((): TestUseCaseContext => {
      return useUseCaseContext(testUseCase, UseCaseArgumentTypes.None, UseCaseModes.Normal);
    });

    const { current } = result;

    expect(current).toBe(defaultUseCaseContext);
  });

  test('should return a new context if map has not saved a usecase with `UseCaseArgumentTypes.Entity` & `UseCaseModes.Normal`', (): void => {
    const { result } = renderHook((): TestUseCaseContext => {
      return useUseCaseContext(testUseCase, UseCaseArgumentTypes.Entity, UseCaseModes.Normal);
    });

    const { current } = result;

    expect(typeof current).toBe('object');
  });

  test('should return a new context if map has not saved a usecase with `UseCaseArgumentTypes.None` & `UseCaseModes.Global`', (): void => {
    const { result } = renderHook((): TestUseCaseContext => {
      return useUseCaseContext(testUseCase, UseCaseArgumentTypes.None, UseCaseModes.Global);
    });

    const { current } = result;

    expect(typeof current).toBe('object');
  });

  test.each([
    {
      type: UseCaseArgumentTypes.Entity,
      mode: UseCaseModes.Normal,
    },
    {
      type: UseCaseArgumentTypes.None,
      mode: UseCaseModes.Global,
    },
    {
      type: UseCaseArgumentTypes.Entity,
      mode: UseCaseModes.Global,
    },
  ])(
    'should return the existing context if map has save a usecase already',
    ({ type, mode }: { type: UseCaseArgumentTypes; mode: UseCaseModes }): void => {
      const { result } = renderHook((): boolean => {
        return useUseCaseContext(testUseCase, type, mode) === useUseCaseContext(testUseCase);
      });

      const { current: isSame } = result;

      expect(isSame).toBe(true);
    },
  );

  test('check context reference times when mount/unmount a usecase', (): void => {
    const { unmount: unmount1 } = renderHook((): void => {
      useUseCaseContext(testUseCase, UseCaseArgumentTypes.Entity);
    });

    const { times: times1 } = usecaseContextReferenceMap.get(testUseCase) as TestUseCaseContextReference;

    const { unmount: unmount2 } = renderHook((): void => {
      useUseCaseContext(testUseCase);
      useUseCaseContext(testUseCase);
    });

    const { times: times2 } = usecaseContextReferenceMap.get(testUseCase) as TestUseCaseContextReference;

    expect(times1).toBe(1);
    expect(times2).toBe(3);

    unmount1();

    const { times: times3 } = usecaseContextReferenceMap.get(testUseCase) as TestUseCaseContextReference;

    expect(times3).toBe(2);

    unmount2();

    const hasSaved = usecaseContextReferenceMap.has(testUseCase);

    expect(hasSaved).toBe(false);
  });

  test('context reference times should not change when rerender hooks', (): void => {
    const { rerender } = renderHook((): void => {
      useUseCaseContext(testUseCase, UseCaseArgumentTypes.Entity);
    });

    rerender();

    const { times } = usecaseContextReferenceMap.get(testUseCase) as TestUseCaseContextReference;

    expect(times).toBe(1);
  });
});
