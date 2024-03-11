import { UseCaseModes } from '@/enums/UseCaseModes';
import { UseCaseHookOptions, UseCaseHookParameters } from '@/hooks/useUseCase/types';
import { EntityReducerMap, EntityUseCase, ReducerMap, UseCase } from '@mic-rexjs/usecases';
import { UseCaseHookFullParameters } from './types';
import { UseCaseArgumentTypes } from '@/enums/UseCaseArgumentTypes';

export const fillArguments = <T, TReducers extends ReducerMap, TUseCaseOptions extends object>(
  args: UseCaseHookParameters,
  argumentTypes: UseCaseArgumentTypes,
): UseCaseHookFullParameters<T, TReducers, TUseCaseOptions> => {
  const [arg1, arg2, arg3, arg4, arg5] = args;
  const hasEntity = (argumentTypes & UseCaseArgumentTypes.Entity) === UseCaseArgumentTypes.Entity;
  const hasMode = (argumentTypes & UseCaseArgumentTypes.Mode) === UseCaseArgumentTypes.Mode;

  if (hasEntity) {
    if (hasMode) {
      return [
        arg1 as T,
        arg2 as EntityUseCase<T, TReducers & EntityReducerMap<T>>,
        arg3 as UseCaseModes,
        (arg4 || {}) as UseCaseHookOptions<T, TUseCaseOptions>,
        arg5 || [],
      ];
    }

    return [
      arg1 as T,
      arg2 as EntityUseCase<T, TReducers & EntityReducerMap<T>>,
      UseCaseModes.Normal,
      (arg3 || {}) as UseCaseHookOptions<T, TUseCaseOptions>,
      (arg4 || []) as unknown[],
    ];
  }

  if (hasMode) {
    return [
      null as T,
      arg1 as UseCase<TReducers>,
      arg2 as UseCaseModes,
      (arg3 || {}) as TUseCaseOptions,
      (arg4 || []) as unknown[],
    ];
  }

  return [
    null as T,
    arg1 as UseCase<TReducers>,
    UseCaseModes.Normal,
    (arg2 || {}) as TUseCaseOptions,
    (arg3 || []) as unknown[],
  ];
};
