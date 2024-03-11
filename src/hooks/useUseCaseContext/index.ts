import { ReducerMap, UseCase } from '@mic-rexjs/usecases';
import { useConstant } from '../useConstant';
import { UseCaseContextReference, UseCaseContextReferenceMap } from '@/configs/useCaseContextReferenceMap/types';
import { usecaseContextReferenceMap } from '@/configs/useCaseContextReferenceMap';
import { createContext } from 'react';
import { UseCaseContext, UseCaseContextValue } from '@/configs/defaultUseCaseContext/types';
import { useUnmount } from 'ahooks';
import { UseCaseArgumentTypes } from '@/enums/UseCaseArgumentTypes';
import { UseCaseModes } from '@/enums/UseCaseModes';
import { defaultUseCaseContext } from '@/configs/defaultUseCaseContext';

export const useUseCaseContext = <
  T extends ReducerMap,
  TUseCaseOptions extends object,
  TContext extends UseCaseContext<UseCaseContextValue<T>>,
>(
  usecase: UseCase<T, TUseCaseOptions>,
  argumentTypes = UseCaseArgumentTypes.None,
  mode = UseCaseModes.Normal,
): TContext => {
  const map = usecaseContextReferenceMap as UseCaseContextReferenceMap<T, TUseCaseOptions>;

  const context = useConstant((): TContext => {
    if (map.has(usecase)) {
      const reference = map.get(usecase) as UseCaseContextReference<UseCaseContextValue<T>>;
      const { value, times } = reference;

      map.set(usecase, {
        value,
        times: times + 1,
      });

      return value as TContext;
    }

    switch (true) {
      case (mode & UseCaseModes.Global) === UseCaseModes.Global:
      case (argumentTypes & UseCaseArgumentTypes.Entity) === UseCaseArgumentTypes.Entity:
        break;

      default:
        return defaultUseCaseContext as TContext;
    }

    const ctx = createContext(null) as TContext;

    map.set(usecase, {
      value: ctx as UseCaseContext<UseCaseContextValue<T>>,
      times: 1,
    });

    return ctx;
  });

  useUnmount((): void => {
    if (!map.has(usecase)) {
      return;
    }

    const reference = map.get(usecase) as UseCaseContextReference<UseCaseContextValue<T>>;
    const { value, times } = reference;

    if (context !== value) {
      return;
    }

    if (times === 1) {
      map.delete(usecase);
      return;
    }

    map.set(usecase, {
      value,
      times: times - 1,
    });
  });

  return context;
};
