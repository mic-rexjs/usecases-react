import { UseCase } from '@mic-rexjs/usecases';
import { useConstant } from '../useConstant';
import { useUnmount } from 'ahooks';
import { ArgumentTypes } from '@/enums/ArgumentTypes';
import { Context, ContextValue } from '@/usecases/contextUseCase/types';
import { useContextUseCase } from '../useContextUseCase';
import { ReducerMap } from '@mic-rexjs/usecases/es/types';

export const useContext = <T extends ReducerMap, TUseCaseOptions extends object>(
  usecase: UseCase<T, TUseCaseOptions>,
  argumentTypes = ArgumentTypes.None,
): Context<ContextValue<T>> => {
  const { registerUseCase, unregisterUseCase } = useContextUseCase();

  const context = useConstant((): Context<ContextValue<T>> => {
    return registerUseCase(usecase, argumentTypes);
  });

  useUnmount((): void => {
    unregisterUseCase(usecase, argumentTypes);
  });

  return context;
};
