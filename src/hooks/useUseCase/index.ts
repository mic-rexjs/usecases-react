import { useArgumentTypes } from '../useArgumentTypes';
import { useConstantFn } from '../useConstantFn';
import { useConstantReducers } from '../useConstantReducers';
import { useContext } from '../useContext';
import { useEntity } from '../useEntity';
import { useFullArguments } from '../useFullArguments';
import { useIsRenderingRef } from '../useIsRenderingRef';
import { useProvider } from '../useProvider';
import { useReducers } from '../useReducers';
import { useStatuses } from '../useStatuses';
import { useStore } from '../useStore';
import { CoreCollection, UseCaseHook, UseCaseHookParameters } from './types';
import { EntityReducers, Reducers } from '@mic-rexjs/usecases';
import { ReducerMap } from '@mic-rexjs/usecases/es/types';
import { useCreation } from 'ahooks';
import { Statuses } from '@/enums/Statuses';
import { ContextualEntityReducers, EntityUseCaseContextValue, UseCaseContext } from '@/usecases/contextUseCase/types';
import { methodUseCase } from '@/usecases/methodUseCase';

export const useUseCase = (<T, TReducers extends ReducerMap, TUseCaseOptions extends object>(
  ...args: UseCaseHookParameters
): TReducers | ContextualEntityReducers<T, EntityReducers<T>> | CoreCollection<T, EntityReducers<T>> => {
  const isRenderingRef = useIsRenderingRef();
  const argumentTypes = useArgumentTypes(args);
  const fullArguments = useFullArguments<T, TReducers, TUseCaseOptions>(args, argumentTypes);
  const [unsafeEntity, unsafeUsecase, options, deps] = fullArguments;
  const { cacheCalls } = useConstantReducers(methodUseCase);
  const usecase = useConstantFn(unsafeUsecase);
  const context = useContext(usecase, argumentTypes);
  const entityContext = context as unknown as UseCaseContext<EntityUseCaseContextValue<T, EntityReducers<T>>>;
  const statuses = useStatuses(context, argumentTypes);
  const store = useStore(entityContext, unsafeEntity, statuses, options, deps);
  const entity = useEntity(store, unsafeEntity, statuses);
  const reducers = useReducers(usecase, context, store, statuses, options as TUseCaseOptions, deps);
  const Provider = useProvider(statuses, context, store, reducers);

  return useCreation(():
    | TReducers
    | ContextualEntityReducers<T, EntityReducers<T>>
    | CoreCollection<T, EntityReducers<T>> => {
    if ((statuses & Statuses.EntityEnabled) !== Statuses.EntityEnabled) {
      return reducers;
    }

    const cachedReducers = cacheCalls(reducers as Reducers as ContextualEntityReducers<T, EntityReducers<T>>, {
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
  }, [statuses, entity, reducers, Provider, isRenderingRef, cacheCalls]);
}) as UseCaseHook;
