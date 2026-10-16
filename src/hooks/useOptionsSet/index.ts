import { useRootCreation } from '../useRootCreation';
import { ReducerMap } from '@mic-rexjs/usecases/es/types';
import { useContext } from 'react';
import { OptionsSet } from '@/classes/OptionsSet';
import { Statuses } from '@/enums/Statuses';
import { EntityUseCaseContextValue, UseCaseContext } from '@/usecases/contextUseCase/types';

export const useOptionsSet = <T, TReducers extends ReducerMap, TOptions extends object>(
  context: UseCaseContext<EntityUseCaseContextValue<T, TReducers, TOptions>>,
  statuses: Statuses,
): OptionsSet<TOptions> => {
  // 过滤掉三个特殊属性
  const contextValue = useContext(context);
  const { optionsSet: contextOptionsSet } = contextValue || {};

  const rootEventsSet = useRootCreation(statuses, (): OptionsSet<TOptions> => {
    return new OptionsSet();
  });

  if (rootEventsSet) {
    return rootEventsSet;
  }

  return contextOptionsSet as OptionsSet<TOptions>;
};
