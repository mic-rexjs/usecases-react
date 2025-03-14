import { Context, ContextValue } from '@/usecases/contextUseCase/types';
import { useContextUseCase } from '../useContextUseCase';
import { ReducerMap } from '@mic-rexjs/usecases/es/types';
import { useContext } from 'react';
import { ArgumentTypes } from '@/enums/ArgumentTypes';

export const useContextValue = <T extends ReducerMap, TContextValue extends ContextValue<T>>(
  context: Context<TContextValue>,
  argumentType: ArgumentTypes,
): TContextValue | null => {
  const { getGlobalContextValue } = useContextUseCase();
  const contextValue = useContext(context);
  const globalContextValue = getGlobalContextValue(context);
  const isGlobal = (argumentType & ArgumentTypes.Global) === ArgumentTypes.Global;

  if (isGlobal) {
    return globalContextValue;
  }

  return contextValue;
};
