import { Scope } from './types';

export const useScope = <T>(scope: Scope<T>): T => {
  return scope();
};
