import { UseCaseModes } from '@/enums/UseCaseModes';
import {
  EntityGetter,
  UseCaseHookMaxParameters,
  UseCaseHookOptions,
  UseCaseHookParameters,
} from '@/hooks/useUseCase/types';
import { EntityReducers, EntityUseCase, Reducers, UseCase } from '@mic-rexjs/usecases';

export const toMaxArguments = <
  T,
  TReducers extends Reducers,
  TEntityReducers extends EntityReducers<T>,
  TUseCaseOptions extends object
>([arg1, arg2, arg3, arg4, arg5]: UseCaseHookParameters<
  T,
  TReducers,
  TEntityReducers,
  TUseCaseOptions
>): UseCaseHookMaxParameters<T, TReducers, TEntityReducers, TUseCaseOptions> => {
  if (typeof arg2 !== 'function') {
    return [
      null as T,
      arg1 as UseCase<TReducers, TUseCaseOptions>,
      UseCaseModes.Normal,
      arg2 || {},
      (arg3 || []) as unknown[],
    ];
  }

  if (typeof arg3 === 'number') {
    return [
      arg1 as T | EntityGetter<T>,
      arg2 as EntityUseCase<T, TEntityReducers, TUseCaseOptions>,
      arg3,
      (arg4 || {}) as UseCaseHookOptions<T, TUseCaseOptions>,
      arg5 || [],
    ];
  }

  return [
    arg1 as T | EntityGetter<T>,
    arg2 as EntityUseCase<T, TEntityReducers, TUseCaseOptions>,
    UseCaseModes.Normal,
    (arg3 || {}) as UseCaseHookOptions<T, TUseCaseOptions>,
    (arg4 || []) as unknown[],
  ];
};
