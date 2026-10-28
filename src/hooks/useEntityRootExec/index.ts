import { useEntityRootReturn } from '../useEntityRootReturn';
import { EntityRootReturnHook } from '../useEntityRootReturn/types';
import { EntityRootExecHook } from './types';
import { RestArguments } from '@mic-rexjs/usecases/es/types';

/**
 * 只在 `RootCoreCollectionHook` 模式下才会执行相关回调
 */
export const useEntityRootExec: EntityRootExecHook = (...args: RestArguments): void => {
  void useEntityRootReturn(...(args as Parameters<EntityRootReturnHook>));
};
