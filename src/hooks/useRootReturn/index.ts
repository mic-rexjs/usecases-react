import { useIfReturn } from '../useIfReturn';
import { RootReturnCallback, RootReturnDestructor, RootReturnHook } from './types';
import { Statuses } from '@/enums/Statuses';
import { Dependencies } from '@/types';

/**
 * 只有 `ReducersHook` 或 `RootCoreCollectionHook` 模式下才执行相关回调
 */
export const useRootReturn: RootReturnHook = <T>(
  statuses: Statuses,
  callback: RootReturnCallback<T>,
  arg3?: RootReturnDestructor | Statuses | Dependencies | null,
  arg4?: Dependencies | Statuses,
  arg5?: Dependencies,
): T | null => {
  const isDepsArg3 = Array.isArray(arg3);
  const isDepsArg4 = Array.isArray(arg4);
  const isStatusesArg3 = typeof arg3 === 'number';
  const isStatusesArg4 = typeof arg4 === 'number';
  const destructor = !isDepsArg3 && !isStatusesArg3 ? arg3 : null;
  const rootStatuses = isStatusesArg3 ? arg3 : isStatusesArg4 ? arg4 : Statuses.RootRuntime;
  const deps = isDepsArg3 ? arg3 : isDepsArg4 ? arg4 : arg5 || [];
  const rootKey = statuses & Statuses.RootKey;
  const rootCalled = (statuses & rootStatuses) === rootStatuses;
  const isEntityRootRuntime = (statuses & Statuses.EntityRootRuntime) === Statuses.EntityRootRuntime;

  return useIfReturn(
    rootCalled,
    (): T => {
      return callback(isEntityRootRuntime);
    },
    (): void => {
      destructor?.(isEntityRootRuntime);
    },
    [rootKey, ...deps],
  );
};
