import { ExecCallback, ExecDestructor } from '../useExec/types';
import { Statuses } from '@/enums/Statuses';
import { Dependencies } from '@/types';

export interface EntityRootExecHook {
  (statuses: Statuses, callback: ExecCallback, deps?: Dependencies): void;
  (statuses: Statuses, callback: ExecCallback, destructor: ExecDestructor | null, deps?: Dependencies): void;
}
