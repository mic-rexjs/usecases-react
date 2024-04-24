import { UseCaseHookOptions, UseCaseHookParameters } from '@/hooks/useUseCase/types';
import { EntityReducers, EntityUseCase, Reducers, UseCase } from '@mic-rexjs/usecases';
import { UseCaseHookFullParameters } from './types';
import { UseCaseArgumentTypes } from '@/enums/UseCaseArgumentTypes';

export const fillArguments = <T, TReducers extends Reducers, TUseCaseOptions extends object>(
  args: UseCaseHookParameters,
  argumentTypes: UseCaseArgumentTypes,
): UseCaseHookFullParameters<T, TReducers, TUseCaseOptions> => {
  const [arg1, arg2, arg3, arg4] = args;
  const hasEntity = (argumentTypes & UseCaseArgumentTypes.Entity) === UseCaseArgumentTypes.Entity;

  if (hasEntity) {
    return [
      arg1 as T,
      arg2 as EntityUseCase<T, TReducers & EntityReducers<T>>,
      (arg3 || {}) as UseCaseHookOptions<T, TUseCaseOptions>,
      (arg4 || []) as unknown[],
    ];
  }

  return [null as T, arg1 as UseCase<TReducers>, (arg2 || {}) as TUseCaseOptions, (arg3 || []) as unknown[]];
};
