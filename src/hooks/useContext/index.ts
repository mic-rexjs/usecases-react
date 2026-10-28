import { useConstant } from '../useConstant';
import { useReturn } from '../useReturn';
import { UseCase } from '@mic-rexjs/usecases';
import { EntityUseCase } from '@mic-rexjs/usecases/es/types';
import { UnknownReducerMap } from '@/types';
import { contextUseCase } from '@/usecases/contextUseCase';
import { EntityUseCaseContextValue, UseCaseContext } from '@/usecases/contextUseCase/types';

export const useContext = <T, TReducers extends UnknownReducerMap<T>, TUseCaseOptions extends object>(
  usecase: UseCase<TReducers, TUseCaseOptions>,
  isEntityRoot: boolean,
): UseCaseContext<EntityUseCaseContextValue<T, TReducers>> => {
  const { getContext, registerUseCase, unregisterUseCase } = useConstant(contextUseCase);

  return useReturn(
    (): UseCaseContext<EntityUseCaseContextValue<T, TReducers>> => {
      if (isEntityRoot) {
        return registerUseCase(usecase as EntityUseCase<T, TReducers>);
      }

      return getContext(usecase);
    },
    (): void => {
      if (!isEntityRoot) {
        return;
      }

      unregisterUseCase(usecase as EntityUseCase<T, TReducers>);
    },
    [usecase, isEntityRoot],
  );
};
