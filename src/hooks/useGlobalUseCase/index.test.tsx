import { EntityReducers, entityUseCase } from '@mic-rexjs/usecases';
import { describe, expect, jest, test } from '@jest/globals';
import { CoreCollection, UseCaseHook } from '../useUseCase/types';
import { UseCaseModes } from '@/enums/UseCaseModes';
import { renderHook } from '@testing-library/react';
import * as useUseCaseModule from '../useUseCase';
import { useGlobalUseCase } from '.';

const numberUseCase = <T extends number>(): EntityReducers<T> => {
  return entityUseCase();
};

describe('useGlobalUseCase', (): void => {
  describe('`useGlobalUseCase` should work the same as `RootCoreCollectionHook`', (): void => {
    test('should pass `UseCaseModes.Global` to `useUseCase`', (): void => {
      const useMockedUseCase = jest.fn<UseCaseHook>();

      jest.spyOn(useUseCaseModule, 'useUseCase').mockImplementation(useMockedUseCase);

      renderHook((): void => {
        useGlobalUseCase(1, numberUseCase);
      });

      expect(useMockedUseCase).toHaveBeenCalledWith(1, numberUseCase, UseCaseModes.Global, void 0, void 0);
      jest.spyOn(useUseCaseModule, 'useUseCase').mockRestore();
    });

    test('should should return `CoreCollection` with Provider', (): void => {
      const { result } = renderHook((): CoreCollection<number, EntityReducers<number>> => {
        return useGlobalUseCase(1, numberUseCase);
      });

      const { current } = result;

      expect(current).toEqual([
        1,
        {
          setEntity: expect.any(Function),
        },
        expect.any(Function),
        void 0,
        void 0,
      ]);
    });
  });
});
