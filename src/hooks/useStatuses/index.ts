import { ArgumentTypes } from '@/enums/ArgumentTypes';
import { Statuses } from '@/enums/Statuses';
import { ContextValue, EntityContextValue } from '@/usecases/contextUseCase/types';
import { EntityReducers } from '@mic-rexjs/usecases';
import { ReducerMap } from '@mic-rexjs/usecases/es/types';
import { useCreation } from 'ahooks';

export const useStatuses = <T extends ReducerMap>(
  argumentTypes: ArgumentTypes,
  contextValue: ContextValue<T> | null,
): Statuses => {
  return useCreation((): Statuses => {
    let statuses = Statuses.None;
    const { store } = (contextValue || {}) as Partial<EntityContextValue<T, EntityReducers<T>>>;
    const hasEntity = (argumentTypes & ArgumentTypes.Entity) === ArgumentTypes.Entity;
    const isGlobal = (argumentTypes & ArgumentTypes.Global) === ArgumentTypes.Global;

    if (hasEntity && !isGlobal) {
      statuses |= Statuses.EntityRootEnabled;
    }

    if (contextValue || isGlobal) {
      statuses |= Statuses.ContextEnabled;
    } else {
      statuses |= Statuses.RootEnabled;
    }

    if (store || isGlobal) {
      statuses |= Statuses.EntityEnabled;
    }

    if (isGlobal) {
      statuses |= Statuses.GlobalEnabled;
    }

    return statuses;
  }, [argumentTypes, contextValue]);
};
