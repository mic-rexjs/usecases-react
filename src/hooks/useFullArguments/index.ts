import { FullParameters } from './types';
import { EntityUseCase, UseCase } from '@mic-rexjs/usecases';
import { UseCaseHookOptions, UseCaseHookParameters } from '@/hooks/useUseCase/types';
import { Dependencies, UnknownReducerMap } from '@/types';

export const useFullArguments = <T, TReducers extends UnknownReducerMap<T>, TUseCaseOptions extends object>(
  args: UseCaseHookParameters,
  isEntityRoot: boolean,
): FullParameters<T, TReducers, TUseCaseOptions> => {
  const [arg1, arg2, arg3, arg4] = args;

  if (isEntityRoot) {
    return [
      arg1 as T,
      arg2 as EntityUseCase<T, TReducers>,
      (arg3 || {}) as UseCaseHookOptions<T, TUseCaseOptions>,
      (arg4 || []) as Dependencies,
    ];
  }

  return [
    null as T,
    arg1 as UseCase<TReducers> | EntityUseCase<T, TReducers>,
    (arg2 || {}) as TUseCaseOptions | UseCaseHookOptions<T, TUseCaseOptions>,
    (arg3 || []) as Dependencies,
  ];
};
