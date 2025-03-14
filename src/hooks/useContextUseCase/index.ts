import { ContextReducers } from '@/usecases/contextUseCase/types';
import { useConstant } from '../useConstant';
import { contextUseCase } from '@/usecases/contextUseCase';

export const useContextUseCase = (): ContextReducers => {
  return useConstant((): ContextReducers => {
    return contextUseCase();
  });
};
