import { useUseCase } from '../../hooks/useUseCase';
import { SafeUseCaseFragment } from '../SafeUseCaseFragment';
import { UseCaseFragmentProps } from './types';
import { EntityReducerMap } from '@mic-rexjs/usecases/es/types';
import { Fragment, useContext } from 'react';
import { contextUseCase } from '@/usecases/contextUseCase';

export const UseCaseFragment = <T, TEntityReducers extends EntityReducerMap<T>>({
  usecase,
  ...props
}: UseCaseFragmentProps<T, TEntityReducers>): React.ReactElement => {
  const { getContext } = useUseCase(contextUseCase);
  const context = getContext(usecase);
  const contextValue = useContext(context);

  return <Fragment>{contextValue === null ? null : <SafeUseCaseFragment usecase={usecase} {...props} />}</Fragment>;
};
