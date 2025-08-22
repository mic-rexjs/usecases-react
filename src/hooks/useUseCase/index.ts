import { useCreation, useLatest } from 'ahooks';
import { useContext as useContextValue } from 'react';
import { EntityReducers, EntityUseCase, Reducers, UseCase } from '@mic-rexjs/usecases';
import { UseCaseHookOptions, UseCaseHook, CoreCollection, UseCaseHookParameters } from './types';
import { useConstantFn } from '../useConstantFn';
import { useProvider } from '../useProvider';
import { initEntityReducers } from '../../methods/initEntityReducers';
import { useContext } from '../useContext';
import { useIsRenderingRef } from '../useIsRenderingRef';
import { useArgumentTypes } from '../useArgumentTypes';
import { useStatuses } from '../useStatuses';
import { Statuses } from '@/enums/Statuses';
import { useEntity } from '../useEntity';
import { useContextualItem } from '../useContextualItem';
import { cacheCalls } from '@/methods/cacheCalls';
import { useCompareDeps } from '../useCompareDeps';
import { captureCalls } from '@/methods/captureCalls';
import { ReducerMap, RestArguments } from '@mic-rexjs/usecases/es/types';
import { ContextualEntityReducers, EntityContextValue } from '@/usecases/contextUseCase/types';
import { useFullArguments } from '../useFullArguments';

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
  const depsKey = useCompareDeps(deps);
  const { reducers: contextReducers = null } = contextValue || {};
  const { store: contextStore = null } = entityContextValue || {};
  const [entity, store] = useEntity(statuses, unsafeEntity, contextStore, options, depsKey);

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

    if (rootEnabled) {
      return [entity, cachedReducers, Provider];
    }

    return [entity, cachedReducers];
  }, [statuses, entity, reducers, Provider, isRenderingRef]);
}) as UseCaseHook;
