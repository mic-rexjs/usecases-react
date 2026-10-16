import { useConstantFn } from '../useConstantFn';
import { UseCaseProvider, UseCaseProviderProps } from './types';
import { ReducerMap } from '@mic-rexjs/usecases/es/types';
import { useLatest } from 'ahooks';
import React, { FC, ReactElement, ReactNode } from 'react';
import { UseCaseContext, UseCaseContextValue } from '@/usecases/contextUseCase/types';

export const useProvider = <T extends ReducerMap, TContextValue extends UseCaseContextValue<T>>(
  context: UseCaseContext<TContextValue>,
  contextValue: TContextValue,
): UseCaseProvider => {
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
    );
  });
};
