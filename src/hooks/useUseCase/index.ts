import { useCreation } from 'ahooks';
import { useContext } from 'react';
import { EntityReducers, EntityUseCase, Reducers, UseCase } from '@mic-rexjs/usecases';
import { UseCaseHookOptions, UseCaseHook, CoreCollection, UseCaseHookParameters } from './types';
import { useConstantFn } from '../useConstantFn';
import { useProvider } from '../useProvider';
import { ContextualEntityReducers, EntityUseCaseContextValue } from '@/configs/defaultUseCaseContext/types';
import { initEntityReducers } from '../../methods/initEntityReducers';
import { useUseCaseContext } from '../useUseCaseContext';
import { useIsRenderingRef } from '../useIsRenderingRef';
import { fillArguments } from '@/methods/fillArguments';
import { useArgumentTypes } from '../useArgumentTypes';
import { useUseCaseStatuses } from '../useUseCaseStatuses';
import { UseCaseStatuses } from '@/enums/UseCaseStatuses';
import { useEntity } from '../useEntity';
import { useContextualItem } from '../useContextualItem';
import { cacheCalls } from '@/methods/cacheCalls';
import { useCompareDeps } from '../useCompareDeps';

export const useUseCase = (<T, TReducers extends Reducers, TUseCaseOptions extends object>(
  ...args: UseCaseHookParameters
): TReducers | ContextualEntityReducers<T, EntityReducers<T>> | CoreCollection<T, EntityReducers<T>> => {
  const isRenderingRef = useIsRenderingRef();
  const argumentTypes = useArgumentTypes(args);
  const fullArguments = fillArguments<T, TReducers, TUseCaseOptions>(args, argumentTypes);
  const [unsafeEntity, unsafeUsecase, mode, options, deps] = fullArguments;
  const unkownUsecase = useConstantFn(unsafeUsecase);
  const usecase = unkownUsecase as UseCase<TReducers, TUseCaseOptions>;
  const entityUseCase = unkownUsecase as EntityUseCase<T, EntityReducers<T>, TUseCaseOptions>;
  const context = useUseCaseContext(unkownUsecase, argumentTypes);
  const contextValue = useContext(context);
  const entityContextValue = contextValue as EntityUseCaseContextValue<T, EntityReducers<T>> | null;
  const statuses = useUseCaseStatuses(argumentTypes, mode, contextValue);
  const depsKey = useCompareDeps(deps);
  const { reducers: contextReducers = null } = contextValue || {};
  const { store: contextStore = null } = entityContextValue || {};
  const [entity, store] = useEntity(statuses, unsafeEntity, contextStore, options, depsKey);

  const reducers = useContextualItem(
    contextReducers,
    statuses,
    (): TReducers => {
      if ((statuses & UseCaseStatuses.EntityEnabled) !== UseCaseStatuses.EntityEnabled) {
        return usecase(options as TUseCaseOptions);
      }

      const hookOptions = options as UseCaseHookOptions<T, TUseCaseOptions>;

      return initEntityReducers(entityUseCase, store, hookOptions) as Reducers as TReducers;
    },
    depsKey,
  );

  const Provider = useProvider(statuses, context, store, reducers);

  return useCreation(():
    | TReducers
    | ContextualEntityReducers<T, EntityReducers<T>>
    | CoreCollection<T, EntityReducers<T>> => {
    if ((statuses & UseCaseStatuses.EntityEnabled) !== UseCaseStatuses.EntityEnabled) {
      return reducers;
    }

    const rootEnabled = (statuses & UseCaseStatuses.RootEnabled) === UseCaseStatuses.RootEnabled;

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
