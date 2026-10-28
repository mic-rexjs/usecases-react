import { ReturnCallback, ReturnDestructor } from '../useReturn/types';
import { Dependencies } from '@/types';

export interface IfReturnHook {
  <T>(value: boolean, callback: ReturnCallback<T>, deps?: Dependencies): T | null;
  <T>(value: boolean, callback: ReturnCallback<T>, destructor: ReturnDestructor | null, deps?: Dependencies): T | null;
}
