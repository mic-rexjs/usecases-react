import { useConstant } from '../useConstant';
import { UseCaseProvider, UseCaseProviderProps } from './types';
import { useLatest } from 'ahooks';
import React, { FC, ReactElement, ReactNode } from 'react';
import { UnknownReducerMap } from '@/types';
import { EntityUseCaseContextValue, UseCaseContext } from '@/usecases/contextUseCase/types';

export const useProvider = <
  T,
  TReducers extends UnknownReducerMap<T>,
  TContextValue extends EntityUseCaseContextValue<T, TReducers>,
>(
  context: UseCaseContext<TContextValue>,
  contextValue: TContextValue,
): UseCaseProvider => {
  const contextValueRef = useLatest(contextValue);

  return useConstant((): UseCaseProvider => {
    return ({ children, with: withProviders = [] }: UseCaseProviderProps): ReactElement => {
      const { Provider: ContextProvider } = context;
      const { current: value } = contextValueRef;
      const providers = Array.isArray(withProviders) ? withProviders : [withProviders];

      return React.createElement(
        ContextProvider,
        { value },
        providers.reduceRight((currentChildren: ReactNode, withProvider: FC): ReactNode => {
          return React.createElement(withProvider, {}, currentChildren);
        }, children),
      );
    };
  });
};
