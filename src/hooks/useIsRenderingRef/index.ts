import { useEffect, useRef } from 'react';

export const useIsRenderingRef = (): React.MutableRefObject<boolean> => {
  const ref = useRef(true);

  ref.current = true;

  useEffect((): void => {
    ref.current = false;
  });

  return ref;
};
