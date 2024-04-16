import { EntityReducers, EntityUseCase } from '@mic-rexjs/usecases';
import { useUseCase } from '../useUseCase';
import { EntityGetter, RootCoreCollection, UseCaseHookOptions } from '../useUseCase/types';
import { StateControllableUseCaseHook } from './types';
import { UseCaseModes } from '@/enums/UseCaseModes';

export const useStateControllableUseCase = (<
  T,
  TEntityReducers extends EntityReducers<T>,
  TUseCaseOptions extends object,
>(
  entity: T | EntityGetter<T>,
  useCase: EntityUseCase<T, TEntityReducers, TUseCaseOptions>,
  options?: UseCaseHookOptions<T, TUseCaseOptions>,
  deps?: unknown[],
): RootCoreCollection<T, TEntityReducers> => {
  return useUseCase(entity, useCase, UseCaseModes.StateControllable, options, deps);
}) as StateControllableUseCaseHook;
