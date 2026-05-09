import { useConstant } from '../useConstant';
import { UseCaseHookParameters } from '../useUseCase/types';
import { ArgumentTypes } from '@/enums/ArgumentTypes';

export const useArgumentTypes = (args: UseCaseHookParameters): ArgumentTypes => {
  return useConstant((): ArgumentTypes => {
    const [, arg2] = args;
    const type2 = typeof arg2;

    if (type2 === 'function') {
      return ArgumentTypes.Entity;
    }

    return ArgumentTypes.None;
  });
};
