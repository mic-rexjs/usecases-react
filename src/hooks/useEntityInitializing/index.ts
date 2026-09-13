import { useExec } from '../useExec';
import { useRef } from 'react';
import { Statuses } from '@/enums/Statuses';

export const useEntityInitializing = (statuses: Statuses): boolean => {
  const isInitializingRef = useRef(true);
  const entityRootEnabled = (statuses & Statuses.EntityRootEnabled) === Statuses.EntityRootEnabled;

  return useExec((): boolean => {
    if (!entityRootEnabled) {
      isInitializingRef.current = true;
      return false;
    }

    const { current: isInitializing } = isInitializingRef;

    isInitializingRef.current = false;
    return isInitializing;
  });
};
