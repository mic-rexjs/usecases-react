import React, { FC, ReactElement, ReactNode } from 'react';

import { UseCaseMappingContext } from '@/configs/usecaseContextMap/types';
import { EntityReducers } from '@mic-rexjs/usecases';
import { useConstant } from '../useConstant';
import { useCreation, useLatest } from 'ahooks';
import { UseCaseHookOptions } from '../useUseCase/types';
import { ContextualEntityReducers, UseCaseContextValue } from '@/configs/defaultUseCaseContext/types';
import { UseCaseProvider, UseCaseProviderProps } from './types';
import { OptionsRefCollection } from '../useOptionsRefCollection/types';

export const useProvider = <T, TEntityReducers extends EntityReducers<T>, TUseCaseOptions extends object>(
  context: UseCaseMappingContext<T, TEntityReducers, TUseCaseOptions>,
  entity: T,
  reducers: ContextualEntityReducers<T, TEntityReducers>,
  optionsRefCollection: OptionsRefCollection<UseCaseHookOptions<T, TUseCaseOptions>>
): UseCaseProvider => {
  const contextValue = useCreation((): UseCaseContextValue<T, TEntityReducers, TUseCaseOptions> => {
    return { entity, reducers, optionsRefCollection };
  }, [entity, reducers, optionsRefCollection]);

  const contextValueRef = useLatest(contextValue);

  return useConstant((): FC => {
    return ({ children, with: withProviders = [] }: UseCaseProviderProps): ReactElement => {
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
    };
  });
};
