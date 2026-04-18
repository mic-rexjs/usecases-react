import { Fragment } from 'react';
import { UseCaseFragmentProps } from './types';
import { useUseCase } from '../../hooks/useUseCase';
import { EntityReducerMap } from '@mic-rexjs/usecases/es/types';
import { contextUseCase } from '@/usecases/contextUseCase';
import { SafeUseCaseFragment } from '../SafeUseCaseFragment';

export const UseCaseFragment = <T, TEntityReducers extends EntityReducerMap<T>>({
  usecase,
  ...props
}: UseCaseFragmentProps<T, TEntityReducers>): React.ReactElement => {
  const { getUseCaseContext } = useUseCase(contextUseCase);
  const context = getUseCaseContext(usecase);

  return <Fragment>{context === null ? null : <SafeUseCaseFragment usecase={usecase} {...props} />}</Fragment>;
};
