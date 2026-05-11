import { useConstantEntityReducers } from '../useConstantEntityReducers';
import { Dependencies } from '@/types';
import { valueUseCase } from '@/usecases/valueUseCase';

export const useDepsKey = (deps: Dependencies): number => {
  const { recordValueMatchWith } = useConstantEntityReducers(deps, valueUseCase<Dependencies>);
  const [, depsKey] = recordValueMatchWith(deps);

  return depsKey;
};
