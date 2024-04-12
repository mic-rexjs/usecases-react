import { Fragment } from 'react';
import { UseCaseFragmentProps } from './types';
import { useUseCase } from '../../hooks/useUseCase';
import { EntityReducers } from '@mic-rexjs/usecases';

export const UseCaseFragment = <T, TEntityReducers extends EntityReducers<T>>({
  usecase,
  onChange,
}: UseCaseFragmentProps<T, TEntityReducers>): React.ReactElement => {
  void useUseCase(usecase, { onChange });

  return <Fragment />;
};
