import { EntityReducers } from '@mic-rexjs/usecases';
import { useUseCase } from '../useUseCase';
import { CoreCollection, ModeCoreCollectionHookParameters } from '../useUseCase/types';
import { UseCaseModes } from '@/enums/UseCaseModes';
import { StatelessUseCaseHook, StatelessUseCaseHookParameters } from './types';

export const useStatelessUseCase = (<
  T,
  TEntityReducers extends EntityReducers<T>,
  TUseCaseOptions extends object = object
>(
  ...args: StatelessUseCaseHookParameters<T, TEntityReducers, TUseCaseOptions>
): CoreCollection<T, TEntityReducers> | CoreCollection<T, TEntityReducers, null> => {
  const [arg1, arg2, ...rest] = args;
  const isContextRoot = typeof arg2 === 'function';

  const coreCollection = useUseCase(
    ...((isContextRoot ? [arg1, arg2, UseCaseModes.Stateless, ...rest] : args) as ModeCoreCollectionHookParameters<
      T,
      TEntityReducers,
      TUseCaseOptions
    >)
  );

  return coreCollection as CoreCollection<T, TEntityReducers> | CoreCollection<T, TEntityReducers, null>;
}) as StatelessUseCaseHook;
