import { ArgumentTypes } from '@/enums/ArgumentTypes';
import { UseCaseHookParameters } from '../useUseCase/types';
import { useConstant } from '../useConstant';
import { EntityUseCase } from '@mic-rexjs/usecases/es/types';
import { useContextUseCase } from '../useContextUseCase';

export const useArgumentTypes = (args: UseCaseHookParameters): ArgumentTypes => {
  const { isGlobal } = useContextUseCase();

  return useConstant((): ArgumentTypes => {
    let types = ArgumentTypes.None;
    const [arg1, arg2] = args;
    const type2 = typeof arg2;

    if (type2 === 'function') {
      types |= ArgumentTypes.Entity;
    } else if (isGlobal(arg1 as EntityUseCase<unknown>)) {
      types |= ArgumentTypes.Global;
    }

    return types;
  });
};
