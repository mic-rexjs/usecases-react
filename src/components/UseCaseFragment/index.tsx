import { Fragment } from 'react';
import { UseCaseFragmentProps } from './types';
import { useUseCase } from '../../hooks/useUseCase';
import { EntityReducers } from '@mic-rexjs/usecases';

export const UseCaseFragment = <T, TReducers extends EntityReducers<T>>({
  usecase,
  watch,
  onChange,
}: UseCaseFragmentProps<T, TReducers>): React.ReactElement => {
  void useUseCase(usecase, { watch, onChange });

  return <Fragment />;
};
