import { useRef } from 'react';
import { isSameArray } from '@/methods/isSameArray';

export const useCompareDeps = <T>(deps: T[]): number => {
  const updateTimesRef = useRef(0);
  const prevDepsRef = useRef<T[]>([]);
  const { current: prevDeps } = prevDepsRef;
  const isSame = isSameArray(deps, prevDeps);

  prevDepsRef.current = deps;
  updateTimesRef.current += isSame ? 0 : 1;

  return updateTimesRef.current;
};
