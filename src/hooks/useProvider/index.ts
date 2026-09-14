import { useConstantFn } from '../useConstantFn';
import { UseCaseProvider, UseCaseProviderProps } from './types';
import { EntityStore } from '@mic-rexjs/usecases';
import { ReducerMap } from '@mic-rexjs/usecases/es/types';
import { useCreation, useLatest } from 'ahooks';
import React, { FC, ReactElement, ReactNode } from 'react';
import { RenderingEventTrigger } from '@/components/RenderingEventTrigger';
import { Statuses } from '@/enums/Statuses';
import { contextUseCase } from '@/usecases/contextUseCase';
import { UseCaseContext, UseCaseContextValue } from '@/usecases/contextUseCase/types';

export const useProvider = <T, TReducers extends ReducerMap>(
  statuses: Statuses,
  context: UseCaseContext<UseCaseContextValue<TReducers>>,
  store: EntityStore<T>,
  reducers: TReducers,
  onRenderingEnd?: VoidFunction,
): UseCaseProvider => {
  const { value: entity } = store;

  const contextValue = useCreation((): UseCaseContextValue<TReducers> => {
    const { createContextValue } = contextUseCase();

    void entity;
    return createContextValue(store, reducers, statuses);
  }, [statuses, entity, store, reducers]);

  const contextValueRef = useLatest(contextValue);

  return useConstantFn(({ children, with: withProviders = [] }: UseCaseProviderProps): ReactElement => {
    const { Provider: ContextProvider } = context;
    const { current: value } = contextValueRef;
    const providers = Array.isArray(withProviders) ? withProviders : [withProviders];

    return React.createElement(
      ContextProvider,
      { value },
      providers.reduceRight((currentChildren: ReactNode, withProvider: FC): ReactNode => {
        return React.createElement(withProvider, {}, currentChildren);
      }, children),
      React.createElement(RenderingEventTrigger, {
        onRendering: onRenderingEnd,
      }),
    );
  });
};
