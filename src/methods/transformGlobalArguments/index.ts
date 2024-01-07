import { UseCaseModes } from '@/enums/UseCaseModes';
import { TransformedGlobalParameters } from './types';
import { GlobalUseCaseHookParameters } from '@/hooks/useGlobalUseCase/types';
import { ModeCoreCollectionHook, PseudoCoreCollectionHook } from '@/hooks/useUseCase/types';

export const transformGlobalArguments = (args: GlobalUseCaseHookParameters): TransformedGlobalParameters => {
  const [arg1, arg2, arg3, arg4] = args;

  if (typeof arg2 === 'function') {
    return [arg1, arg2, UseCaseModes.Global, arg3, arg4] as Parameters<ModeCoreCollectionHook>;
  }

  return [arg1, UseCaseModes.Global, arg2, arg3] as Parameters<PseudoCoreCollectionHook>;
};
