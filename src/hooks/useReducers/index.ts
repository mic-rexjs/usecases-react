import { useDepsKey } from '../useDepsKey';
import { NonEntitySymbolSet } from '../useUseCase/types';
import { ReducerMap, SymbolSetTarget, UseCase } from '@mic-rexjs/usecases/es/types';
import { useCreation, useMemoizedFn } from 'ahooks';
import { Dependencies } from '@/types';

export const useReducers = <T extends ReducerMap, TUseCaseOptions extends object = object>(
  usecase: UseCase<T & SymbolSetTarget<NonEntitySymbolSet>, TUseCaseOptions>,
  options?: TUseCaseOptions,
  deps: Dependencies = [],
): T => {
  const depsKey = useDepsKey(deps);

  const onCreate = useMemoizedFn((): T => {
    return usecase(options);
  });

  return useCreation((): T => {
    void depsKey;
    void usecase;

    return onCreate();
  }, [depsKey, usecase, onCreate]);
};
