import { useRootReturn } from '../useRootReturn';
import { RootReturnCallback, RootReturnDestructor } from '../useRootReturn/types';
import { EntityRootReturnHook } from './types';
import { Statuses } from '@/enums/Statuses';
import { Dependencies } from '@/types';

/**
 * 只在 `RootCoreCollectionHook` 模式下才会执行相关回调
 */
export const useEntityRootReturn: EntityRootReturnHook = <T>(
  statuses: Statuses,
  callback: RootReturnCallback<T>,
  arg3?: RootReturnDestructor | Dependencies | null,
  arg4?: Dependencies,
): T | null => {
  const isDepsArgs = Array.isArray(arg3);
  const [destructor, deps] = isDepsArgs ? [null, arg3] : [arg3, arg4];

  return useRootReturn(statuses, callback, destructor || null, Statuses.EntityRootRuntime, deps);
};
