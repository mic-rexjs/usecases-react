import { UseCaseArgumentTypes } from '@/enums/UseCaseArgumentTypes';
import { UseCaseHookParameters } from '../useUseCase/types';
import { useConstant } from '../useConstant';

export const useArgumentTypes = (args: UseCaseHookParameters): UseCaseArgumentTypes => {
  return useConstant((): UseCaseArgumentTypes => {
    let types = UseCaseArgumentTypes.None;
    const [, arg2, arg3] = args;
    const type2 = typeof arg2;

    if (type2 === 'function') {
      types |= UseCaseArgumentTypes.Entity;
    }

    switch ('number') {
      case type2:
      case typeof arg3:
        types |= UseCaseArgumentTypes.Mode;
        break;
    }

    return types;
  });
};
