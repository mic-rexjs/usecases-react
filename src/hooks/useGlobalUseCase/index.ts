import { Reducers, UseCase } from '@mic-rexjs/usecases';
import { GlobalUseCaseHook } from './types';
import { useUseCase } from '../useUseCase';
import { PseudoCoreCollection } from '../useUseCase/types';
import { UseCaseModes } from '@/enums/UseCaseModes';

export const useGlobalUseCase = (<T extends Reducers, TUseCaseOptions extends object>(
  useCase: UseCase<T, TUseCaseOptions>,
  options?: TUseCaseOptions,
  deps?: unknown[],
): PseudoCoreCollection<T> => {
  return useUseCase(useCase, UseCaseModes.Global, options, deps);
}) as GlobalUseCaseHook;
