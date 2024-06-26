import { EntityUseCaseContextValue, UseCaseContextValue } from '@/configs/defaultUseCaseContext/types';
import { UseCaseArgumentTypes } from '@/enums/UseCaseArgumentTypes';
import { UseCaseStatuses } from '@/enums/UseCaseStatuses';
import { EntityReducers, Reducers } from '@mic-rexjs/usecases';
import { useCreation } from 'ahooks';

export const useUseCaseStatuses = <T extends Reducers>(
  argumentTypes: UseCaseArgumentTypes,
  contextValue: UseCaseContextValue<T> | null,
): UseCaseStatuses => {
  return useCreation((): UseCaseStatuses => {
    let statuses = UseCaseStatuses.None;
    const { store } = (contextValue || {}) as Partial<EntityUseCaseContextValue<T, EntityReducers<T>>>;

    if ((argumentTypes & UseCaseArgumentTypes.Entity) === UseCaseArgumentTypes.Entity) {
      statuses |= UseCaseStatuses.EntityRootEnabled;
    }

    if (contextValue) {
      statuses |= UseCaseStatuses.ContextEnabled;
    } else {
      statuses |= UseCaseStatuses.RootEnabled;
    }

    if (store) {
      statuses |= UseCaseStatuses.EntityEnabled;
    }

    return statuses;
  }, [argumentTypes, contextValue]);
};
