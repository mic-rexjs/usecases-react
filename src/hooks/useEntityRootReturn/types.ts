import { RootReturnCallback, RootReturnDestructor } from '../useRootReturn/types';
import { Statuses } from '@/enums/Statuses';
import { Dependencies } from '@/types';

export interface EntityRootReturnHook {
  <T>(statuses: Statuses, callback: RootReturnCallback<T>, deps?: Dependencies): T | null;

  <T>(
    statuses: Statuses,
    callback: RootReturnCallback<T>,
    destructor: RootReturnDestructor | null,
    deps?: Dependencies,
  ): T | null;
}
