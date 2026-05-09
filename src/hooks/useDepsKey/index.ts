import { useEntityReducers } from '../useEntityReducers';
import { Dependencies } from '@/types';
import { valueUseCase } from '@/usecases/valueUseCase';

export const useDepsKey = (deps: Dependencies): number => {
  const { recordValueMatchWith } = useEntityReducers(deps, valueUseCase<Dependencies>);
  const [, depsKey] = recordValueMatchWith(deps);

  return depsKey;
};
