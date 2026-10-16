import { useRootCreation } from '../useRootCreation';
import { RootCreationCallback } from '../useRootCreation/types';
import { Statuses } from '@/enums/Statuses';
import { Dependencies } from '@/types';

export const useContextualItem = <T>(
  contextItem: T | null,
  statuses: Statuses,
  callback: RootCreationCallback<T>,
  deps: Dependencies = [],
): T => {
  const rootEnabled = (statuses & Statuses.RootEnabled) === Statuses.RootEnabled;
  const rootItem = useRootCreation(statuses, callback, false, deps);

  if (rootEnabled) {
    return rootItem as T;
  }

  return contextItem as T;
};
