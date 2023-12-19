import { EntityReducers } from '@mic-rexjs/usecases';
import { GlobalUseCaseHook, GlobalUseCaseHookParameters } from './types';
import { ContextualEntityReducers } from '@/configs/defaultUseCaseContext/types';
import { useUseCase } from '../useUseCase';
import { CoreCollection, ModeCoreCollectionHookParameters } from '../useUseCase/types';
import { UseCaseModes } from '@/enums/UseCaseModes';

export const useGlobalUseCase = (<
  T,
  TEntityReducers extends EntityReducers<T>,
  TUseCaseOptions extends object = object
>(
  ...args: GlobalUseCaseHookParameters<T, TEntityReducers, TUseCaseOptions>
): CoreCollection<T, TEntityReducers> | ContextualEntityReducers<T, TEntityReducers> => {
  const [arg1, arg2, ...rest] = args;
  const isContextRoot = typeof arg2 === 'function';

  const coreCollection = useUseCase(
    ...((isContextRoot ? [arg1, arg2, UseCaseModes.Global, ...rest] : args) as ModeCoreCollectionHookParameters<
      T,
      TEntityReducers,
      TUseCaseOptions
    >)
  );

  if (isContextRoot) {
    return coreCollection as CoreCollection<T, TEntityReducers>;
  }

  return coreCollection[1] as ContextualEntityReducers<T, TEntityReducers>;
}) as GlobalUseCaseHook;
