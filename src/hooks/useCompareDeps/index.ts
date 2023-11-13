import { useRef } from 'react';
import { useScope } from '../useScope';

export const useCompareDeps = <T>(deps: T[]): React.Key => {
  const updateTimesRef = useRef(0);
  const prevDepsRef = useRef<T[]>([]);
  const { current: prevDeps } = prevDepsRef;
  const { length: prevLength } = prevDeps;
  const { length } = deps;

  const updated = useScope((): boolean => {
    if (length !== prevLength) {
      return true;
    }

    for (let i = 0; i < length; i++) {
      if (deps[i] === prevDeps[i]) {
        continue;
      }

      return true;
    }

    return false;
  });

  prevDepsRef.current = deps;
  updateTimesRef.current += updated ? 1 : 0;

  return updateTimesRef.current;
};
