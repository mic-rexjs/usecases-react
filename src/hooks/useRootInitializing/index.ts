import { useReturn } from '../useReturn';
import { useRef } from 'react';
import { Statuses } from '@/enums/Statuses';

export const useRootInitializing = (statuses: Statuses): boolean => {
  const rootKey = statuses & Statuses.RootKey;
  const isInitializingRef = useRef(true);

  return useReturn(
    (): boolean => {
      const { current: isInitializing } = isInitializingRef;

      isInitializingRef.current = false;
      return isInitializing;
    },
    (): void => {
      isInitializingRef.current = true;
    },
    [rootKey],
  );
};
