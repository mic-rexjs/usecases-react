import { useLatest } from 'ahooks';
import React, { FC, ReactElement, ReactNode, useMemo } from 'react';
import { EntityStore, ReducerMap } from '@mic-rexjs/usecases';
import { UseCaseContext, UseCaseContextValue } from '@/configs/defaultUseCaseContext/types';
import { UseCaseProvider, UseCaseProviderProps } from './types';
import { useConstantFn } from '../useConstantFn';
import { UseCaseStatuses } from '@/enums/UseCaseStatuses';

export const useProvider = <T, TReducers extends ReducerMap>(
  statuses: UseCaseStatuses,
  context: UseCaseContext<UseCaseContextValue<TReducers>>,
  store: EntityStore<T>,
  reducers: TReducers
): UseCaseProvider => {
  const { value: entity } = store;

  const contextValue = useMemo((): UseCaseContextValue<TReducers> => {
    void entity;

    if ((statuses & UseCaseStatuses.EntityEnabled) === UseCaseStatuses.EntityEnabled) {
      return {
        store,
        reducers,
      } as UseCaseContextValue<TReducers>;
    }

    return { reducers };
  }, [statuses, entity, store, reducers]);

  const contextValueRef = useLatest(contextValue);

  return useConstantFn(({ children, with: withProviders = [] }: UseCaseProviderProps): ReactElement => {
    const { Provider: ContextProvider } = context;

    return React.createElement(
      ContextProvider,
      {
        value: contextValueRef.current,
      },
      withProviders.reduceRight((currentChildren: ReactNode, withProvider: FC): ReactNode => {
        return React.createElement(withProvider, {}, currentChildren);
      }, children)
    );
  });
};
