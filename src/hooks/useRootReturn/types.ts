import { Statuses } from '@/enums/Statuses';
import { Dependencies } from '@/types';

export interface RootReturnCallback<T> {
  (isEntityRootRuntime: boolean): T;
}

export interface RootReturnDestructor {
  (isEntityRootRuntime: boolean): void;
}

export interface RootReturnHook {
  <T>(statuses: Statuses, callback: RootReturnCallback<T>, deps?: Dependencies): T | null;
  <T>(statuses: Statuses, callback: RootReturnCallback<T>, rootStatuses?: Statuses, deps?: Dependencies): T | null;

  <T>(
    statuses: Statuses,
    callback: RootReturnCallback<T>,
    destructor: RootReturnDestructor | null,
    deps?: Dependencies,
  ): T | null;

  <T>(
    statuses: Statuses,
    callback: RootReturnCallback<T>,
    destructor: RootReturnDestructor | null,
    rootStatuses?: Statuses,
    deps?: Dependencies,
  ): T | null;
}
