import { useCreation, useMemoizedFn } from 'ahooks';
import { useContext, useState } from 'react';
import { EntityReducers, EntityUseCase, Reducers, UseCase } from '@mic-rexjs/usecases';
import { UseCaseHookOptions, UseCaseHook, EntityGetter, CoreCollection, UseCaseHookParameters } from './types';
import { useConstant } from '../useConstant';
import { useConstantFn } from '../useConstantFn';
import { useProvider } from '../useProvider';
import { useCompareDeps } from '../useCompareDeps';
import { ContextualEntityReducers, UseCaseContext } from '@/configs/defaultUseCaseContext/types';
import { UseCaseProvider } from '../useProvider/types';
import { initEntityReducers } from '../../methods/initEntityReducers';
import { triggerCallbacks } from '@/methods/triggerCallbacks';
import { getRootEntity } from '@/methods/getRootEntity';
import { useUseCaseContext } from '../useUseCaseContext';
import { defaultUseCaseContext } from '@/configs/defaultUseCaseContext';
import { useIsRenderingRef } from '../useIsRenderingRef';
import { cacheReducerCalls } from '@/methods/cacheReducerCalls';
import { UseCaseModes } from '@/enums/UseCaseModes';
import { toMaxArguments } from '@/methods/toMaxArguments';
import { useChangeCallbackCollection } from '../useChangeCallbackCollection';

export const useUseCase = (<
  T,
  TReducers extends Reducers,
  TEntityReducers extends EntityReducers<T>,
  TUseCaseOptions extends object
>(
  ...args: UseCaseHookParameters<T, TReducers, TEntityReducers, TUseCaseOptions>
): CoreCollection<T, TEntityReducers> | CoreCollection<T, TEntityReducers, null> | TReducers => {
  const [unsafeEntity, unsafeUsecase, unsafeMode, options, deps] = toMaxArguments(args);
  const [entityState, setEntityState] = useState(unsafeEntity);

  const usecase = useConstantFn(unsafeUsecase);
  const entityUseCase = usecase as EntityUseCase<T, TEntityReducers, TUseCaseOptions>;
  const mode = useConstant(unsafeMode);
  const depsKey = useCompareDeps(deps);

  const isRenderingRef = useIsRenderingRef();
  const isContextRoot = useConstant(typeof args[1] === 'function');

  const defaultContext = defaultUseCaseContext as UseCaseContext<T, TEntityReducers>;
  const context = useUseCaseContext(entityUseCase, isContextRoot ? null : defaultContext);
  const getContextValue = useContext(context);
  const hasContextValueGetter = getContextValue !== null;

  const {
    entity: contextEntity,
    reducers: contextEntityReducers = null,
    changeCallbackCollection: contextChangeCallbackCollection = null,
  } = getContextValue?.() || {};

  // 是否需要初始化根 `redurcers`
  const isRoot = isContextRoot || !hasContextValueGetter;
  // 是否为上下文模式
  const isContextMode = isContextRoot || hasContextValueGetter;

  const changeCallbackCollection = useChangeCallbackCollection(
    isRoot,
    contextChangeCallbackCollection,
    options as UseCaseHookOptions<T, TUseCaseOptions>
  );

  const entity = useCreation((): T => {
    if (!isContextRoot) {
      return contextEntity as T;
    }

    return getRootEntity(entityState as T, unsafeEntity as T | EntityGetter<T>, mode);
  }, [isContextRoot, contextEntity, mode, entityState, unsafeEntity]);

  const onEntityChange = useMemoizedFn((newEntity: T, oldEntity: T): void => {
    if ((mode & UseCaseModes.Stateless) !== UseCaseModes.Stateless) {
      setEntityState(newEntity);
    }

    triggerCallbacks(changeCallbackCollection, newEntity, oldEntity);
  });

  const createRootEntityReducers = useMemoizedFn((): ContextualEntityReducers<T, TEntityReducers> => {
    const initOptions = options as UseCaseHookOptions<T, TUseCaseOptions>;

    return initEntityReducers(entity, entityUseCase, initOptions, onEntityChange);
  });

  const createReducers = useMemoizedFn((): TReducers => {
    return (usecase as UseCase<TReducers, TUseCaseOptions>)(options as TUseCaseOptions);
  });

  const rootEntityReducers = useCreation((): ContextualEntityReducers<T, TEntityReducers> | null => {
    void depsKey;

    if (!isContextRoot) {
      return null;
    }

    return createRootEntityReducers();
  }, [isContextRoot, depsKey, createRootEntityReducers]);

  const entityReducers = useCreation((): ContextualEntityReducers<T, TEntityReducers> => {
    return rootEntityReducers || contextEntityReducers || ({} as ContextualEntityReducers<T, TEntityReducers>);
  }, [rootEntityReducers, contextEntityReducers]);

  const reducers = useCreation((): TReducers => {
    void depsKey;

    if (isContextMode) {
      return {} as TReducers;
    }

    return createReducers();
  }, [isContextMode, depsKey, createReducers]);

  const Provider = useProvider(context, mode, entity, entityReducers, changeCallbackCollection);

  const createCoreCollection = useMemoizedFn(
    (
      coreEntity: T,
      coreReducers: ContextualEntityReducers<T, TEntityReducers>
    ): CoreCollection<T, TEntityReducers, UseCaseProvider | null> => {
      return [
        coreEntity,
        cacheReducerCalls(coreReducers, (): boolean => {
          return isRenderingRef.current;
        }),
        isContextRoot ? Provider : null,
      ];
    }
  );

  return useCreation((): TReducers | CoreCollection<T, TEntityReducers, UseCaseProvider | null> => {
    if (isContextMode) {
      return createCoreCollection(entity, entityReducers);
    }

    return reducers as TReducers;
  }, [isContextMode, entity, entityReducers, reducers, createCoreCollection]);
}) as UseCaseHook;
