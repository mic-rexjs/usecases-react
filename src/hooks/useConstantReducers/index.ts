import { useConstant } from '../useConstant';
import { NonEntitySymbolSet } from '../useUseCase/types';
import { ReducerMap, SymbolSetTarget, UseCase } from '@mic-rexjs/usecases/es/types';

export const useConstantReducers = <T extends ReducerMap, TUseCaseOptions extends object = object>(
  usecase: UseCase<T & SymbolSetTarget<NonEntitySymbolSet>, TUseCaseOptions>,
  options?: TUseCaseOptions,
): T => {
  return useConstant((): T => {
    return usecase(options);
  });
};
