import { useIfReturn } from '../useIfReturn';
import { ReturnCallback, ReturnDestructor } from '../useReturn/types';
import { EntityReturnHook } from './types';
import { Statuses } from '@/enums/Statuses';
import { Dependencies } from '@/types';

/**
 * 只在 `RootCoreCollectionHook` 或 `ContextualCoreCollectionHook` 模式下才会执行相关回调
 */
export const useEntityReturn: EntityReturnHook = <T>(
  statuses: Statuses,
  callback: ReturnCallback<T>,
  arg3?: ReturnDestructor | Dependencies | null,
  arg4?: Dependencies,
): T | null => {
  const isDepsArgs = Array.isArray(arg3);
  const [destructor, deps] = isDepsArgs ? [null, arg3] : [arg3, arg4];
  const hasEntity = (statuses & Statuses.Entity) === Statuses.Entity;

  return useIfReturn(hasEntity, callback, destructor || null, deps);
};
