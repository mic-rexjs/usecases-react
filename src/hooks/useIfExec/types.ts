import { ExecCallback, ExecDestructor } from '../useExec/types';
import { Dependencies } from '@/types';

export interface TrueExecHook {
  <T>(value: boolean, callback: ExecCallback, deps?: Dependencies): T;

  <T>(value: boolean, callback: ExecCallback, destructor: ExecDestructor | null, deps?: Dependencies): T;
}
