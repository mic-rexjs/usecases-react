import { EntityReducerMap } from '@mic-rexjs/usecases/es/types';
import { SafeUseCaseFragmentProps } from '../SafeUseCaseFragment/types';

export interface UseCaseFragmentProps<T, TEntityReducers extends EntityReducerMap<T>>
  extends SafeUseCaseFragmentProps<T, TEntityReducers> {}
