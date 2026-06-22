import { EntityReducers } from '@mic-rexjs/usecases';
import { ReducerMap } from '@mic-rexjs/usecases/es/types';
import { useCreation } from 'ahooks';
import { useContext } from 'react';
import { ArgumentTypes } from '@/enums/ArgumentTypes';
import { Statuses } from '@/enums/Statuses';
import { EntityUseCaseContextValue, UseCaseContext, UseCaseContextValue } from '@/usecases/contextUseCase/types';

export const useStatuses = <T extends ReducerMap>(
  context: UseCaseContext<UseCaseContextValue<T>>,
  argumentTypes: ArgumentTypes,
): Statuses => {
  const contextValue = useContext(context);

  return useCreation((): Statuses => {
    let statuses = Statuses.None;
    const { store } = (contextValue || {}) as Partial<EntityUseCaseContextValue<T, EntityReducers<T>>>;
    const hasEntity = (argumentTypes & ArgumentTypes.Entity) === ArgumentTypes.Entity;

    if (hasEntity) {
      statuses |= Statuses.EntityRootEnabled;
    }

    if (contextValue) {
      statuses |= Statuses.ContextEnabled;
    } else {
      statuses |= Statuses.RootEnabled;
    }

    if (store) {
      statuses |= Statuses.EntityEnabled;
    }

    return statuses;
  }, [argumentTypes, contextValue]);
};
