import { useDepsKey } from '../useDepsKey';
import { UseCaseProvider } from '../useProvider/types';
import { useReturn } from '../useReturn';
import { useLatest } from 'ahooks';

export const useProviders = (...providers: UseCaseProvider[]): UseCaseProvider[] => {
  const depsKey = useDepsKey(providers);
  const providersRef = useLatest(providers);

  return useReturn((): UseCaseProvider[] => {
    return providersRef.current;
  }, [depsKey]);
};
