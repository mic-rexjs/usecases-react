import { useCreation, useMemoizedFn } from 'ahooks';
import { useContext, useState } from 'react';
import { EntityReducers, EntityUseCase, Reducers, UseCase } from '@mic-rexjs/usecases';
import { UseCaseHookOptions, UseCaseHook, EntityGetter, CoreCollection } from './types';
import { useConstant } from '../useConstant';
import { useConstantFn } from '../useConstantFn';
import { useProvider } from '../useProvider';
import { useCompareDeps } from '../useCompareDeps';
import { ContextualEntityReducers } from '@/configs/defaultUseCaseContext/types';
import { UseCaseProvider } from '../useProvider/types';
import { initEntityReducers } from '../../methods/initEntityReducers';
import { useOptionsRefCollection } from '../useOptionsRefCollection';
import { triggerCallbacks } from '@/methods/triggerCallbacks';
import { getRootEntity } from '@/methods/getRootEntity';
import { useUseCaseContext } from '../useUseCaseContext';
import { defaultUseCaseContext } from '@/configs/defaultUseCaseContext';
import { UseCaseMappingContext } from '@/configs/usecaseContextMap/types';
import { useIsRenderingRef } from '../useIsRenderingRef';
import { cacheReducerCalls } from '@/methods/cacheReducerCalls';

export const useUseCase: UseCaseHook = <
  T,
  TReducers extends Reducers,
  TEntityReducers extends EntityReducers<T>,
  TUseCaseOptions extends object
>(
  arg1: T | EntityGetter<T> | UseCase<TReducers, TUseCaseOptions> | EntityUseCase<T, TEntityReducers, TUseCaseOptions>,
  arg2?: EntityUseCase<T, TEntityReducers, TUseCaseOptions> | TUseCaseOptions,
  arg3?: UseCaseHookOptions<T, TUseCaseOptions> | unknown[],
  arg4?: unknown[]
): TReducers | CoreCollection<T, TEntityReducers, UseCaseProvider | null> => {
  const hasInitialEntity = useConstant(typeof arg2 === 'function');
  const options = ((hasInitialEntity ? arg3 : arg2) || {}) as UseCaseHookOptions<T, TUseCaseOptions> | TUseCaseOptions;
  const { stateless } = options as UseCaseHookOptions<T, TUseCaseOptions>;
  const [entityState, setEntityState] = useState(hasInitialEntity && !stateless ? (arg1 as T | EntityGetter<T>) : null);
  const deps = ((hasInitialEntity ? arg4 : arg3) || []) as unknown[];
  const depsKey = useCompareDeps(deps);
  const isRenderingRef = useIsRenderingRef();

  const usecase = useConstantFn(
    hasInitialEntity
      ? (arg2 as EntityUseCase<T, TEntityReducers, TUseCaseOptions>)
      : (arg1 as UseCase<TReducers, TUseCaseOptions>)
  );

  const entityUseCase = usecase as EntityUseCase<T, TEntityReducers, TUseCaseOptions>;
  const defaultContext = defaultUseCaseContext as UseCaseMappingContext<T, TEntityReducers, TUseCaseOptions>;
  const context = useUseCaseContext(entityUseCase, hasInitialEntity ? null : defaultContext);

  const {
    entity: contextEntity,
    reducers: contextEntityReducers = null,
    optionsRefCollection: contextOptionsRefCollection,
  } = useContext(context);

  // 只有 `contextOptionsRefCollection` 是可控的，是当前 `hook` 生成的，所以用其来判断最保险
  const hasContextOptionsRefCollection = typeof contextOptionsRefCollection === 'object';
  // 是否需要初始化根 `redurcers`
  const isRoot = hasInitialEntity || !hasContextOptionsRefCollection;
  // 是否为上下文模式
  const isContextMode = hasInitialEntity || hasContextOptionsRefCollection;
  // 获取 `optionsRefCollection`
  const optionsRefCollection = useOptionsRefCollection(isRoot, contextOptionsRefCollection || null, options);

  const entity = useCreation((): T => {
    if (!hasInitialEntity) {
      return contextEntity as T;
    }

    return getRootEntity(entityState as T, arg1 as T | EntityGetter<T>, stateless);
  }, [hasInitialEntity, contextEntity, stateless, entityState, arg1]);

  const onEntityChange = useMemoizedFn((newEntity: T, oldEntity: T): void => {
    if (!stateless) {
      setEntityState(newEntity);
    }

    triggerCallbacks(optionsRefCollection, newEntity, oldEntity);
  });

  const createRootEntityReducers = useMemoizedFn((): ContextualEntityReducers<T, TEntityReducers> => {
    const initOptions = options as UseCaseHookOptions<T, TUseCaseOptions>;

    return initEntityReducers(entity, entityUseCase, initOptions, onEntityChange);
  });

  const createReducers = useMemoizedFn((): TReducers => {
    return (usecase as UseCase<TReducers, TUseCaseOptions>)(options);
  });

  const rootEntityReducers = useCreation((): ContextualEntityReducers<T, TEntityReducers> | null => {
    void depsKey;

    if (!hasInitialEntity) {
      return null;
    }

    return createRootEntityReducers();
  }, [hasInitialEntity, depsKey, createRootEntityReducers]);

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

  const Provider = useProvider(context, entity, entityReducers, optionsRefCollection);

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
        hasInitialEntity ? Provider : null,
      ];
    }
  );

  return useCreation((): TReducers | CoreCollection<T, TEntityReducers, UseCaseProvider | null> => {
    if (isContextMode) {
      return createCoreCollection(entity, entityReducers);
    }

    return reducers as TReducers;
  }, [isContextMode, entity, entityReducers, reducers, createCoreCollection]);
};
