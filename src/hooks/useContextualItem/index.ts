import { useCreation } from 'ahooks';
import { UseCaseStatuses } from '@/enums/UseCaseStatuses';
import { CreateContextualItemFactory } from './types';
import { useMemoizedCall } from '../useMemoizedCall';

export const useContextualItem = <T>(
  statuses: UseCaseStatuses,
  contextItem: T | null,
  createFactory: CreateContextualItemFactory<T>,
  deps: unknown[] = [],
): T => {
  const create = useMemoizedCall(createFactory, deps);

  return useCreation((): T => {
    const rootEnabled = (statuses & UseCaseStatuses.RootEnabled) === UseCaseStatuses.RootEnabled;

    if (!rootEnabled && contextItem) {
      return contextItem as T;
    }

    return create();
  }, [statuses, contextItem, create]);
};
