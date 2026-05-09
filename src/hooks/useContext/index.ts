import { useConstant } from '../useConstant';
import { UseCase } from '@mic-rexjs/usecases';
import { ReducerMap } from '@mic-rexjs/usecases/es/types';
import { useUnmount } from 'ahooks';
import { ArgumentTypes } from '@/enums/ArgumentTypes';
import { contextUseCase } from '@/usecases/contextUseCase';
import { Context, ContextValue } from '@/usecases/contextUseCase/types';

export const useContext = <T extends ReducerMap, TUseCaseOptions extends object>(
  usecase: UseCase<T, TUseCaseOptions>,
  argumentTypes = ArgumentTypes.None,
): Context<ContextValue<T>> => {
  const context = useConstant((): Context<ContextValue<T>> => {
    const { registerUseCase } = contextUseCase();

    return registerUseCase(usecase, argumentTypes);
  });

  useUnmount((): void => {
    const { unregisterUseCase } = contextUseCase();

    unregisterUseCase(usecase, argumentTypes);
  });

  return context;
};
