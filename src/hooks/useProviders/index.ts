import { useDepsKey } from '../useDepsKey';
import { UseCaseProvider } from '../useProvider/types';
import { useCreation, useLatest } from 'ahooks';

export const useProviders = (...providers: UseCaseProvider[]): UseCaseProvider[] => {
  const depsKey = useDepsKey(providers);
  const providersRef = useLatest(providers);

  return useCreation((): UseCaseProvider[] => {
    void depsKey;

    return providersRef.current;
  }, [depsKey, providersRef]);
};
