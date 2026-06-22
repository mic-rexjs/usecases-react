import { useLatest } from 'ahooks';
import { useEffect } from 'react';

export const useIsRenderingRef = (): React.RefObject<boolean> => {
  const ref = useLatest(true);

  useEffect((): void => {
    ref.current = false;
  });

  return ref;
};
