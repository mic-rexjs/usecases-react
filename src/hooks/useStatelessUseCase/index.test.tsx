import { EntityReducers, entityUseCase } from '@mic-rexjs/usecases';
import { describe, expect, jest, test } from '@jest/globals';
import { CoreCollection, UseCaseHook } from '../useUseCase/types';
import { UseCaseModes } from '@/enums/UseCaseModes';
import { render, renderHook } from '@testing-library/react';
import { useMount } from 'ahooks';
import * as useUseCaseModule from '../useUseCase';
import { useStatelessUseCase } from '.';

const numberUseCase = (): EntityReducers<number> => {
  return entityUseCase();
};

describe('useStatelessUseCase', (): void => {
  describe('`useStatelessUseCase` should work the same as `RootCoreCollectionHook`', (): void => {
    test('should pass `UseCaseModes.Stateless` to `useUseCase`', (): void => {
      const useMockedUseCase = jest.fn<UseCaseHook>();

      jest.spyOn(useUseCaseModule, 'useUseCase').mockImplementation(useMockedUseCase);

      renderHook((): void => {
        useStatelessUseCase(1, numberUseCase);
      });

      expect(useMockedUseCase).toHaveBeenCalledWith(1, numberUseCase, UseCaseModes.Stateless);
      jest.spyOn(useUseCaseModule, 'useUseCase').mockRestore();
    });

    test('should should return `CoreCollection` with Provider', (): void => {
      const { result } = renderHook((): CoreCollection<number, EntityReducers<number>> => {
        return useStatelessUseCase(1, numberUseCase);
      });

      const { current } = result;

      expect(current).toEqual([
        1,
        {
          setEntity: expect.any(Function),
        },
        expect.any(Function),
      ]);
    });
  });

  describe('`useStatelessUseCase` should work the same as `ContextualCoreCollectionHook`', (): void => {
    test('check `useUseCase` has received correct arguments', (): void => {
      const useMockedUseCase = jest.fn<UseCaseHook>();

      jest.spyOn(useUseCaseModule, 'useUseCase').mockImplementation(useMockedUseCase);

      renderHook((): void => {
        try {
          useStatelessUseCase(numberUseCase);
        } catch (e) {
          //
        }
      });

      expect(useMockedUseCase).toHaveBeenCalledWith(numberUseCase);
      jest.spyOn(useUseCaseModule, 'useUseCase').mockRestore();
    });

    test('should should only return reducers', (): void => {
      const onChildMount = jest.fn();

      const Child = (): null => {
        const coreCollection = useStatelessUseCase(numberUseCase);

        useMount((): void => {
          onChildMount(coreCollection);
        });

        return null;
      };

      const Parent = (): React.ReactElement => {
        const [, , Provider] = useStatelessUseCase(1, numberUseCase);

        return (
          <Provider>
            <Child />
          </Provider>
        );
      };

      render(<Parent />);

      expect(onChildMount).toHaveBeenCalledWith([
        1,
        {
          setEntity: expect.any(Function),
        },
        null,
      ]);
    });
  });
});
