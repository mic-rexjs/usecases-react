import { useConstantReducers } from '../useConstantReducers';
import { useMemoizedFn, usePrevious } from 'ahooks';
import { useRef } from 'react';
import { Dependencies } from '@/types';
import { objectUtilsUseCase } from '@/usecases/objectUtilsUseCase';

export const useDepsKey = (deps: Dependencies): React.Key => {
  const keyRef = useRef(0);
  const prevDeps = usePrevious(deps);
  const { isEqual } = useConstantReducers(objectUtilsUseCase);
  const equal = isEqual(deps, prevDeps);

  const getDepsKey = useMemoizedFn((): React.Key => {
    const { current: key } = keyRef;

    if (equal) {
      return key;
    }

    const newKey = key + 1;

    keyRef.current = newKey;
    return newKey;
  });

  return getDepsKey();
};
