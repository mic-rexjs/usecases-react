import React, { FC, ReactElement, ReactNode, useMemo } from 'react';
import { useLatest } from 'ahooks';
import { EntityStore } from '@mic-rexjs/usecases';
import { UseCaseProvider, UseCaseProviderProps } from './types';
import { useConstantFn } from '../useConstantFn';
import { Statuses } from '@/enums/Statuses';
import { Context, ContextValue } from '@/usecases/contextUseCase/types';
import { useContextUseCase } from '../useContextUseCase';
import { ReducerMap } from '@mic-rexjs/usecases/es/types';

export const useProvider = <T, TReducers extends ReducerMap>(
  statuses: Statuses,
  context: Context<ContextValue<TReducers>>,
  store: EntityStore<T>,
  reducers: TReducers,
): UseCaseProvider => {
  const { value: entity } = store;
  const { createContextValue } = useContextUseCase();

  const contextValue = useMemo((): ContextValue<TReducers> => {
    void entity;
    return createContextValue(store, reducers, statuses);
  }, [statuses, entity, store, reducers, createContextValue]);

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
