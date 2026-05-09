import { SafeUseCaseFragmentProps } from '../SafeUseCaseFragment/types';
import { EntityReducerMap } from '@mic-rexjs/usecases/es/types';

export interface UseCaseFragmentProps<T, TEntityReducers extends EntityReducerMap<T>> extends SafeUseCaseFragmentProps<
  T,
  TEntityReducers
> {}
