import { useChanged } from '../useChanged';
import { useReturn } from '../useReturn';
import { useRef } from 'react';
import { Statuses } from '@/enums/Statuses';

export const useAlternateStatuses = <T>(value: T, statusesX: Statuses, statusesY: Statuses): Statuses => {
  const statuesRef = useRef(statusesX);
  const isChanged = useChanged(value);

  return useReturn((): Statuses => {
    const { current: currentStatuses } = statuesRef;

    if (!isChanged) {
      return currentStatuses;
    }

    const newStatuses = currentStatuses === statusesX ? statusesY : statusesX;

    statuesRef.current = newStatuses;
    return newStatuses;
  });
};
