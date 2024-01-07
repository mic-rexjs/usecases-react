import { ModeCoreCollectionHook, PseudoCoreCollectionHook } from '@/hooks/useUseCase/types';

export type TransformedGlobalParameters = Parameters<ModeCoreCollectionHook> | Parameters<PseudoCoreCollectionHook>;
