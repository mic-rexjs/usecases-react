import { useContext } from '../useContext';
import { useContextValue } from '../useContextValue';
import { useEntity } from '../useEntity';
import { useFullArguments } from '../useFullArguments';
import { useIsRenderingRef } from '../useIsRenderingRef';
import { useProvider } from '../useProvider';
import { useReducers } from '../useReducers';
import { useReturn } from '../useReturn';
import { useStatuses } from '../useStatuses';
import { useStore } from '../useStore';
import { CoreCollection, UseCaseHook, UseCaseHookParameters } from './types';
import { Statuses } from '@/enums/Statuses';
import { cacheCalls } from '@/methods/cacheCalls';
import { UnknownReducerMap } from '@/types';
import { ContextualEntityReducers } from '@/usecases/contextUseCase/types';

export const useUseCase: UseCaseHook = <T, TReducers extends UnknownReducerMap<T>, TUseCaseOptions extends object>(
  ...args: UseCaseHookParameters
): TReducers | ContextualEntityReducers<T, TReducers> | CoreCollection<T, TReducers> => {
  const [, arg2] = args;
  const isEntityRoot = typeof arg2 === 'function';
  const fullArguments = useFullArguments<T, TReducers, TUseCaseOptions>(args, isEntityRoot);
  const [unsafeEntity, usecase, options] = fullArguments;
  const context = useContext<T, TReducers, TUseCaseOptions>(usecase, isEntityRoot);
  const statuses = useStatuses(fullArguments, context, isEntityRoot);
  const store = useStore(unsafeEntity, context, statuses);
  const reducers = useReducers(usecase, store, context, statuses, options);
  const entity = useEntity<T>(store, statuses, options);
  const contextValue = useContextValue(entity, store, reducers, statuses);
  const Provider = useProvider(context, contextValue);
  const isRenderingRef = useIsRenderingRef();

  return useReturn((): TReducers | ContextualEntityReducers<T, TReducers> | CoreCollection<T, TReducers> => {
    const hasEntity = (statuses & Statuses.Entity) === Statuses.Entity;

    if (!hasEntity) {
      return reducers;
    }

    const cachedReducers = cacheCalls(reducers as ContextualEntityReducers<T, TReducers>, {
      onShouldCache(): boolean {
        return isRenderingRef.current;
      },
    });

    const isNull = entity === null;
    const isArray = Array.isArray(entity);
    const isObjectType = typeof entity === 'object';
    const isObjectEntity = isObjectType && !isNull && !isArray;
    // 这里是为了让访问器 `getter` 的值保持唯一性，否则每次 `getter` 返回的对象都是新对象，无法用于 `deps`
    const newEntity = isObjectEntity ? { ...entity } : entity;

    return [newEntity, cachedReducers, Provider];
  }, [statuses, entity, reducers, Provider, isRenderingRef]);
};
