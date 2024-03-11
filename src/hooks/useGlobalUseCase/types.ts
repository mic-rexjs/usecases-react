import { Reducers, UseCase } from '@mic-rexjs/usecases';
import { PseudoCoreCollection } from '../useUseCase/types';

export interface GlobalUseCaseHook {
  <T extends Reducers, TUseCaseOptions extends object = object>(
    usecase: UseCase<T, TUseCaseOptions>,
    options?: TUseCaseOptions,
    deps?: unknown[],
  ): PseudoCoreCollection<T>;
}
