import { useGlobalUseCase } from '.';
import { EntityReducers, entityUseCase } from '@mic-rexjs/usecases';
import { describe, expect, jest, test } from '@jest/globals';
import { CoreCollection, UseCaseHook } from '../useUseCase/types';
import { UseCaseModes } from '@/enums/UseCaseModes';
import { render, renderHook } from '@testing-library/react';
import { useMount } from 'ahooks';
import * as useUseCaseModule from '../useUseCase';

const numberUseCase = (): EntityReducers<number> => {
  return entityUseCase();
};

describe('useGlobalUseCase', (): void => {
  describe('`useGlobalUseCase` should work the same as `RootCoreCollectionHook`', (): void => {
    test('check `useUseCase` has received correct arguments', (): void => {
      const useMockedUseCase = jest.fn<UseCaseHook>();

      jest.spyOn(useUseCaseModule, 'useUseCase').mockImplementation(useMockedUseCase);

      renderHook((): void => {
        useGlobalUseCase(1, numberUseCase);
      });

      expect(useMockedUseCase).toHaveBeenCalledWith(1, numberUseCase, UseCaseModes.Global);
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
      ]);
    });
  });

  describe('`useGlobalUseCase` should work the same as `GlobalReducersHook`', (): void => {
    test('check `useUseCase` has received correct arguments', (): void => {
      const useMockedUseCase = jest.fn<UseCaseHook>();

      jest.spyOn(useUseCaseModule, 'useUseCase').mockImplementation(useMockedUseCase);

      renderHook((): void => {
        try {
          useGlobalUseCase(numberUseCase);
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
        const reducers = useGlobalUseCase(numberUseCase);

        useMount((): void => {
          onChildMount(reducers);
        });

        return null;
      };

      const Parent = (): React.ReactElement => {
        const [, , Provider] = useGlobalUseCase(1, numberUseCase);

        return (
          <Provider>
            <Child />
          </Provider>
        );
      };

      render(<Parent />);

      expect(onChildMount).toHaveBeenCalledWith({
        setEntity: expect.any(Function),
      });
    });
  });
});
