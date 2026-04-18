import { UseCase } from '@mic-rexjs/usecases';
import { useConstant } from '../useConstant';
import { useUnmount } from 'ahooks';
import { ArgumentTypes } from '@/enums/ArgumentTypes';
import { Context, ContextValue } from '@/usecases/contextUseCase/types';
import { ReducerMap } from '@mic-rexjs/usecases/es/types';
import { contextUseCase } from '@/usecases/contextUseCase';

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
