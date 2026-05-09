import { useConstantFn } from '../useConstantFn';
import { UseCaseProvider, UseCaseProviderProps } from './types';
import { EntityStore } from '@mic-rexjs/usecases';
import { ReducerMap } from '@mic-rexjs/usecases/es/types';
import { useCreation, useLatest } from 'ahooks';
import React, { FC, ReactElement, ReactNode } from 'react';
import { Statuses } from '@/enums/Statuses';
import { contextUseCase } from '@/usecases/contextUseCase';
import { Context, ContextValue } from '@/usecases/contextUseCase/types';

export const useProvider = <T, TReducers extends ReducerMap>(
  statuses: Statuses,
  context: Context<ContextValue<TReducers>>,
  store: EntityStore<T>,
  reducers: TReducers,
): UseCaseProvider => {
  const { value: entity } = store;

  const contextValue = useCreation((): ContextValue<TReducers> => {
    const { createContextValue } = contextUseCase();

    void entity;
    return createContextValue(store, reducers, statuses);
  }, [statuses, entity, store, reducers]);

  const contextValueRef = useLatest(contextValue);

  return useConstantFn(({ children, with: withProviders = [] }: UseCaseProviderProps): ReactElement => {
    const { Provider: ContextProvider } = context;
    const { current: value } = contextValueRef;

    return React.createElement(
      ContextProvider,
      { value },
      withProviders.reduceRight((currentChildren: ReactNode, withProvider: FC): ReactNode => {
        return React.createElement(withProvider, {}, currentChildren);
      }, children),
    );
  });
};
