import { useReturn } from '../useReturn';
import { ExecHook } from './types';

export const useExec = ((...args: Parameters<ExecHook>): void => {
  void useReturn(...args);
}) as ExecHook;
