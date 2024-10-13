import { ContextReducers } from './types';

export const contextUseCase = (): ContextReducers => {
  const hasContext = <T>(target: T): boolean => {
    if (typeof target !== 'object') {
      return false;
    }

    if (!Array.isArray(target)) {
      return false;
    }

    const { length } = target;
    const reducers = target[1];

    if (length < 2) {
      return false;
    }

    return typeof reducers === 'object';
  };

  return {
    hasContext,
  };
};
