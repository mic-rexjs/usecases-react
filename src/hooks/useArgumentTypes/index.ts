import { ArgumentTypes } from '@/enums/ArgumentTypes';
import { UseCaseHookParameters } from '../useUseCase/types';
import { useConstant } from '../useConstant';

export const useArgumentTypes = (args: UseCaseHookParameters): ArgumentTypes => {
  return useConstant((): ArgumentTypes => {
    let types = ArgumentTypes.None;
    const [, arg2] = args;
    const type2 = typeof arg2;

    if (type2 === 'function') {
      types |= ArgumentTypes.Entity;
    }

    return types;
  });
};
