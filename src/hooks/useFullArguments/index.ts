import { UseCaseHookOptions, UseCaseHookParameters } from '@/hooks/useUseCase/types';
import { EntityReducers, EntityUseCase, UseCase } from '@mic-rexjs/usecases';
import { FullParameters } from './types';
import { ArgumentTypes } from '@/enums/ArgumentTypes';
import { ReducerMap } from '@mic-rexjs/usecases/es/types';

export const useFullArguments = <T, TReducers extends ReducerMap, TUseCaseOptions extends object>(
  args: UseCaseHookParameters,
  argumentTypes: ArgumentTypes,
): FullParameters<T, TReducers, TUseCaseOptions> => {
  const [arg1, arg2, arg3, arg4] = args;
  const withoutEntity = (argumentTypes & ArgumentTypes.Entity) !== ArgumentTypes.Entity;

  if (withoutEntity) {
    return [
      null as T,
      arg1 as UseCase<TReducers> | EntityUseCase<T, TReducers & EntityReducers<T>>,
      (arg2 || {}) as TUseCaseOptions | UseCaseHookOptions<T, TUseCaseOptions>,
      (arg3 || []) as unknown[],
    ];
  }

  return [
    arg1 as T,
    arg2 as EntityUseCase<T, TReducers & EntityReducers<T>>,
    (arg3 || {}) as UseCaseHookOptions<T, TUseCaseOptions>,
    (arg4 || []) as unknown[],
  ];
};
