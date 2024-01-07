import { EntityReducerMap, ReducerMap } from '@mic-rexjs/usecases';
import { GlobalUseCaseHook, GlobalUseCaseHookParameters } from './types';
import { useUseCase } from '../useUseCase';
import { PseudoCoreCollection, RootCoreCollection } from '../useUseCase/types';
import { transformGlobalArguments } from '@/methods/transformGlobalArguments';
import { TransformedGlobalParameters } from '@/methods/transformGlobalArguments/types';

export const useGlobalUseCase = (<T, TReducers extends ReducerMap>(
  ...args: GlobalUseCaseHookParameters
): RootCoreCollection<T, EntityReducerMap<T>> | PseudoCoreCollection<TReducers> => {
  const transformedArgs = transformGlobalArguments(args);

  return (
    useUseCase as (
      ...args: TransformedGlobalParameters
    ) => RootCoreCollection<T, EntityReducerMap<T>> | PseudoCoreCollection<TReducers>
  )(...transformedArgs);
}) as GlobalUseCaseHook;
