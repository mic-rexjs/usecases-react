import { Dependencies } from '@/types';

export interface ExecCallback {
  (): void;
}

export interface ExecDestructor {
  (isUnmount: boolean): void;
}

export interface ExecHook {
  (callback: ExecCallback, deps?: Dependencies): void;
  (callback: ExecCallback, destructor: ExecDestructor | null, deps?: Dependencies): void;
}
