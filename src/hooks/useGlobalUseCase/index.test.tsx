import { useGlobalUseCase } from '.';
import { Reducers } from '@mic-rexjs/usecases';
import { describe, expect, jest, test } from '@jest/globals';
import { UseCaseHook } from '../useUseCase/types';
import { UseCaseModes } from '@/enums/UseCaseModes';
import { renderHook } from '@testing-library/react';
import * as useUseCaseModule from '../useUseCase';

const mathUseCase = (): Reducers => {
  return {};
};

describe('useGlobalUseCase', (): void => {
  describe('`useGlobalUseCase` should work the same as `GlobalPseudoCoreCollectionHook`', (): void => {
    test('check `useUseCase` has received correct arguments', (): void => {
      const useMockedUseCase = jest.fn<UseCaseHook>();

      jest.spyOn(useUseCaseModule, 'useUseCase').mockImplementation(useMockedUseCase);

      renderHook((): void => {
        useGlobalUseCase(mathUseCase);
      });

      expect(useMockedUseCase).toHaveBeenCalledWith(mathUseCase, UseCaseModes.Global, void 0, void 0);
      jest.spyOn(useUseCaseModule, 'useUseCase').mockRestore();
    });
  });
});
