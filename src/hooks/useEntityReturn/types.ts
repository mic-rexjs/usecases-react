import { ReturnCallback, ReturnDestructor } from '../useReturn/types';
import { Statuses } from '@/enums/Statuses';
import { Dependencies } from '@/types';

export interface EntityReturnHook {
  <T>(statuses: Statuses, callback: ReturnCallback<T>, deps?: Dependencies): T | null;

  <T>(
    statuses: Statuses,
    callback: ReturnCallback<T>,
    destructor: ReturnDestructor | null,
    deps?: Dependencies,
  ): T | null;
}
