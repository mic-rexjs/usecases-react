import React, { FC, ReactElement, ReactNode, useCallback } from 'react';
import { EntityReducers } from '@mic-rexjs/usecases';
import { useLatest } from 'ahooks';
import {
  ChangeCallback,
  ContextualEntityReducers,
  UseCaseContext,
  UseCaseContextValue,
} from '@/configs/defaultUseCaseContext/types';
import { UseCaseProvider, UseCaseProviderProps } from './types';
import { UseCaseModes } from '@/enums/UseCaseModes';
import { useCompareDeps } from '../useCompareDeps';
import { useConstantFn } from '../useConstantFn';

export const useProvider = <T, TEntityReducers extends EntityReducers<T>>(
  context: UseCaseContext<T, TEntityReducers>,
  mode: UseCaseModes,
  entity: T,
  reducers: ContextualEntityReducers<T, TEntityReducers>,
  changeCallbackCollection: ChangeCallback<T>[]
): UseCaseProvider => {
  const isGlobal = (mode & UseCaseModes.Global) === UseCaseModes.Global;

  const contextValueRef = useLatest<UseCaseContextValue<T, TEntityReducers>>({
    entity,
    reducers,
    changeCallbackCollection,
  });

  const key = useCompareDeps(isGlobal ? [] : [entity, reducers, changeCallbackCollection]);

  const getContextValue = useCallback((): UseCaseContextValue<T, TEntityReducers> => {
    void key;
    return contextValueRef.current;
  }, [key, contextValueRef]);

  const getContextValueRef = useLatest(getContextValue);

  return useConstantFn(({ children, with: withProviders = [] }: UseCaseProviderProps): ReactElement => {
    const { Provider: ContextProvider } = context;

    return React.createElement(
      ContextProvider,
      {
        value: getContextValueRef.current,
      },
      withProviders.reduceRight((currentChildren: ReactNode, withProvider: FC): ReactNode => {
        return React.createElement(withProvider, {}, currentChildren);
      }, children)
    );
  });
};
