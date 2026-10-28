import { useExec } from '../useExec';
import { ExecCallback, ExecDestructor } from '../useExec/types';
import { TrueExecHook } from './types';
import { Dependencies } from '@/types';

export const useIfExec: TrueExecHook = (
  value: boolean,
  callback: ExecCallback,
  arg3?: ExecDestructor | Dependencies | null,
  arg4?: Dependencies,
): void => {
  const hasDestructor = typeof arg3 === 'function' || arg3 === null;
  const [destructor, deps] = hasDestructor ? [arg3, arg4] : [null, arg3];

  return useExec(
    (): void => {
      if (!value) {
        return;
      }

      callback();
    },
    (isUnmount: boolean): void => {
      if (!value) {
        return;
      }

      destructor?.(isUnmount);
    },
    deps,
  );
};
