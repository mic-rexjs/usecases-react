import { UseCaseArgumentTypes } from '@/enums/UseCaseArgumentTypes';
import { UseCaseHookParameters } from '../useUseCase/types';
import { useConstant } from '../useConstant';

export const useArgumentTypes = (args: UseCaseHookParameters): UseCaseArgumentTypes => {
  return useConstant((): UseCaseArgumentTypes => {
    let types = UseCaseArgumentTypes.None;
    const [, arg2] = args;
    const type2 = typeof arg2;

    if (type2 === 'function') {
      types |= UseCaseArgumentTypes.Entity;
    }

    return types;
  });
};
