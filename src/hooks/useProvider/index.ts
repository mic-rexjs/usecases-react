import { useLatest } from 'ahooks';
import React, { FC, ReactElement, ReactNode, useCallback, useMemo } from 'react';
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
  const entity = store.getValue();

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

  const isGlobal = (statuses & UseCaseStatuses.GlobalEnabled) === UseCaseStatuses.GlobalEnabled;
  const updateDep = isGlobal ? null : contextValue;
  const contextValueRef = useLatest(contextValue);

  // 这里必须使用 `useCallback`，因为要使用在 `Provider` 的 `value` 属性上面，需要可变化的
  const getContextValue = useCallback((): UseCaseContextValue<TReducers> => {
    void updateDep;
    return contextValueRef.current;
  }, [updateDep, contextValueRef]);

  const getterRef = useLatest(getContextValue);

  return useConstantFn(({ children, with: withProviders = [] }: UseCaseProviderProps): ReactElement => {
    const { Provider: ContextProvider } = context;

    return React.createElement(
      ContextProvider,
      {
        value: getterRef.current,
      },
      withProviders.reduceRight((currentChildren: ReactNode, withProvider: FC): ReactNode => {
        return React.createElement(withProvider, {}, currentChildren);
      }, children)
    );
  });
};
