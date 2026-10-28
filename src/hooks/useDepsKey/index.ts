import { useChanged } from '../useChanged';
import { useConstant } from '../useConstant';
import { useMemoizedFn } from 'ahooks';
import { useRef } from 'react';
import { Dependencies } from '@/types';
import { objectUtilsUseCase } from '@/usecases/objectUtilsUseCase';

export const useDepsKey = (deps: Dependencies): React.Key => {
  const keyRef = useRef(0);
  const { isEqual } = useConstant(objectUtilsUseCase);

  const isChanged = useChanged(deps, (newDeps: Dependencies, oldDeps?: Dependencies): boolean => {
    return !isEqual(newDeps, oldDeps);
  });

  const onCreate = useMemoizedFn((): React.Key => {
    const { current: key } = keyRef;

    if (!isChanged) {
      return key;
    }

    const newKey = key + 1;

    keyRef.current = newKey;
    return newKey;
  });

  return onCreate();
};
