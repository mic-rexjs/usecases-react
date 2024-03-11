import { useCreation } from 'ahooks';
import { useContext } from 'react';
import { EntityReducerMap, EntityUseCase, ReducerMap, UseCase } from '@mic-rexjs/usecases';
import { UseCaseHookOptions, UseCaseHook, CoreCollection, UseCaseHookParameters, PseudoCoreCollection } from './types';
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
import { useSafeMode } from '../useSafeMode';

export const useUseCase = (<T, TReducers extends ReducerMap, TUseCaseOptions extends object>(
  ...args: UseCaseHookParameters
): TReducers | CoreCollection<T, EntityReducerMap<T>> | PseudoCoreCollection<TReducers> => {
  const argumentTypes = useArgumentTypes(args);
  const fullArguments = fillArguments<T, TReducers, TUseCaseOptions>(args, argumentTypes);
  const [unsafeEntity, unsafeUsecase, unsafeMode, options, deps] = fullArguments;
  const unkownUsecase = useConstantFn(unsafeUsecase);
  const usecase = unkownUsecase as UseCase<TReducers, TUseCaseOptions>;
  const entityUseCase = unkownUsecase as EntityUseCase<T, EntityReducerMap<T>, TUseCaseOptions>;
  const isRenderingRef = useIsRenderingRef();
  const mode = useSafeMode(unsafeMode, argumentTypes);
  const context = useUseCaseContext(unkownUsecase, argumentTypes, mode);
  const contextValue = useContext(context);
  const entityContextValue = contextValue as EntityUseCaseContextValue<T, EntityReducerMap<T>> | null;
  const statuses = useUseCaseStatuses(argumentTypes, mode, contextValue);
  const { reducers: contextReducers = null } = contextValue || {};
  const { store: contextStore = null } = entityContextValue || {};
  const [entity, store] = useEntity(statuses, unsafeEntity, contextStore, options);

  const reducers = useContextualItem(
    statuses,
    contextReducers,
    (): TReducers => {
      if ((statuses & UseCaseStatuses.EntityEnabled) !== UseCaseStatuses.EntityEnabled) {
        return usecase(options as TUseCaseOptions);
      }

      const hookOptions = options as UseCaseHookOptions<T, TUseCaseOptions>;

      return initEntityReducers(entityUseCase, store, hookOptions) as ReducerMap as TReducers;
    },
    deps,
  );

  const Provider = useProvider(statuses, context, store, reducers);

  return useCreation((): TReducers | CoreCollection<T, EntityReducerMap<T>> | PseudoCoreCollection<TReducers> => {
    if ((statuses & UseCaseStatuses.ContextEnabled) !== UseCaseStatuses.ContextEnabled) {
      return reducers;
    }

    const rootEnabled = (statuses & UseCaseStatuses.RootEnabled) === UseCaseStatuses.RootEnabled;

    if ((statuses & UseCaseStatuses.EntityEnabled) !== UseCaseStatuses.EntityEnabled) {
      return rootEnabled ? [reducers, Provider] : reducers;
    }

    const cachedReducers = cacheCalls(reducers as ReducerMap as ContextualEntityReducers<T, EntityReducerMap<T>>, {
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
