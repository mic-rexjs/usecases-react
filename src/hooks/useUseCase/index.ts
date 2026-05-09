import { initEntityReducers } from '../../methods/initEntityReducers';
import { useArgumentTypes } from '../useArgumentTypes';
import { useConstantFn } from '../useConstantFn';
import { useContext } from '../useContext';
import { useContextualItem } from '../useContextualItem';
import { useDepsKey } from '../useDepsKey';
import { useEntity } from '../useEntity';
import { useFullArguments } from '../useFullArguments';
import { useIsRenderingRef } from '../useIsRenderingRef';
import { useProvider } from '../useProvider';
import { useReducers } from '../useReducers';
import { useStatuses } from '../useStatuses';
import { CoreCollection, UseCaseHook, UseCaseHookOptions, UseCaseHookParameters } from './types';
import { EntityReducers, EntityUseCase, Reducers, UseCase } from '@mic-rexjs/usecases';
import { ReducerMap, RestArguments } from '@mic-rexjs/usecases/es/types';
import { useCreation, useLatest } from 'ahooks';
import { useContext as useContextValue } from 'react';
import { Statuses } from '@/enums/Statuses';
import { ContextualEntityReducers, EntityContextValue } from '@/usecases/contextUseCase/types';
import { methodUseCase } from '@/usecases/methodUseCase';

export const useUseCase = (<T, TReducers extends ReducerMap, TUseCaseOptions extends object>(
  ...args: UseCaseHookParameters
): TReducers | ContextualEntityReducers<T, EntityReducers<T>> | CoreCollection<T, EntityReducers<T>> => {
  const isRenderingRef = useIsRenderingRef();
  const argumentTypes = useArgumentTypes(args);
  const fullArguments = useFullArguments<T, TReducers, TUseCaseOptions>(args, argumentTypes);
  const [unsafeEntity, unsafeUsecase, options, deps] = fullArguments;
  const unkownUsecase = useConstantFn(unsafeUsecase);
  const usecase = unkownUsecase as UseCase<TReducers, TUseCaseOptions>;
  const entityUseCase = unkownUsecase as EntityUseCase<T, EntityReducers<T>, TUseCaseOptions>;
  const context = useContext(unkownUsecase, argumentTypes);
  const contextValue = useContextValue(context);
  const entityContextValue = contextValue as EntityContextValue<T, EntityReducers<T>> | null;
  const statuses = useStatuses(argumentTypes, contextValue);
  const optionsRef = useLatest(options);
  const depsKey = useDepsKey(deps);
  const { reducers: contextReducers = null } = contextValue || {};
  const { store: contextStore = null } = entityContextValue || {};
  const [entity, store] = useEntity(statuses, unsafeEntity, contextStore, options, depsKey);
  const { cacheCalls, captureCalls } = useReducers(methodUseCase);

  const reducers = useContextualItem(
    contextReducers,
    statuses,
    (): TReducers => {
      const opts = captureCalls(options, <TReturn>(key: string, callArgs: RestArguments): TReturn => {
        return (optionsRef.current as Record<string, (...args: RestArguments) => TReturn>)[key]?.(...callArgs);
      });

      if ((statuses & Statuses.EntityEnabled) !== Statuses.EntityEnabled) {
        return usecase(opts as TUseCaseOptions);
      }

      const hookOptions = opts as UseCaseHookOptions<T, TUseCaseOptions>;

      return initEntityReducers(entityUseCase, store, hookOptions) as Reducers as TReducers;
    },
    depsKey,
  );

  const Provider = useProvider(statuses, context, store, reducers);

  return useCreation(():
    | TReducers
    | ContextualEntityReducers<T, EntityReducers<T>>
    | CoreCollection<T, EntityReducers<T>> => {
    if ((statuses & Statuses.EntityEnabled) !== Statuses.EntityEnabled) {
      return reducers;
    }

    const rootEnabled = (statuses & Statuses.RootEnabled) === Statuses.RootEnabled;

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

    if (rootEnabled) {
      return [newEntity, cachedReducers, Provider];
    }

    return [newEntity, cachedReducers];
  }, [statuses, entity, reducers, Provider, isRenderingRef, cacheCalls]);
}) as UseCaseHook;
