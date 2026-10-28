import { useAlternateStatuses } from '../useAlternateStatuses';
import { useDepsKey } from '../useDepsKey';
import { FullParameters } from '../useFullArguments/types';
import { useContext } from 'react';
import { Statuses } from '@/enums/Statuses';
import { UnknownReducerMap } from '@/types';
import { EntityUseCaseContextValue, UseCaseContext } from '@/usecases/contextUseCase/types';

// 遵循一个要求：参数不变，`statuses` 的计算结果不能变
export const useStatuses = <T, TReducers extends UnknownReducerMap<T>, TUseCaseOptions extends object>(
  fullArguments: FullParameters<T, TReducers, TUseCaseOptions>,
  context: UseCaseContext<EntityUseCaseContextValue<T, TReducers>>,
  isEntityRoot: boolean,
): Statuses => {
  let statuses = Statuses.None;
  const [entity, usecase, , deps] = fullArguments;
  const isInitializer = typeof entity === 'function';
  const contextValue = useContext(context);
  const isEntityContext = !isEntityRoot && contextValue !== null;
  const { key } = isEntityContext ? contextValue : { key: isEntityRoot ? Statuses.RootX : Statuses.RootY };
  const depsKey = useDepsKey(deps);
  const rootKey = useDepsKey([usecase, key]);
  const reducersKey = useDepsKey([rootKey, depsKey]);
  const rootStatuses = useAlternateStatuses(rootKey, Statuses.RootX, Statuses.RootY);
  const usecaseStatuses = useAlternateStatuses(usecase, Statuses.UseCaseX, Statuses.UseCaseY);
  const reducersStatuses = useAlternateStatuses(reducersKey, Statuses.ReducersX, Statuses.ReducersY);
  const depsStatuses = useAlternateStatuses(depsKey, Statuses.DepsX, Statuses.DepsY);

  const initialEntityStatuses = useAlternateStatuses(
    isInitializer ? reducersKey : entity,
    Statuses.InitialEntityX,
    Statuses.InitialEntityY,
  );

  switch (true) {
    case isEntityRoot:
      // `entity` 参数，只有 `entity root` 模式才有
      statuses |= initialEntityStatuses;
      statuses |= Statuses.EntityRootRuntime;
      break;

    case isEntityContext:
      statuses |= Statuses.EntityContextRuntime;
      break;

    default:
      statuses |= Statuses.RootRuntime;
      break;
  }

  // `root` 是肯定有的，要么自身为 `root`，要么上下文有 `root`
  statuses |= rootStatuses;
  // `usecase` 作为标识符参数，也是肯定有的
  statuses |= usecaseStatuses;
  // `reducers` 作为 `usecase` 的产物，也是肯定有的
  statuses |= reducersStatuses;
  // `deps` 虽然是可选参数，但是默认值是空数组 `[]`，所以也是肯定有的
  statuses |= depsStatuses;

  return statuses;
};
