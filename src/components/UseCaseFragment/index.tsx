import { Fragment } from 'react';
import { UseCaseFragmentProps } from './types';
import { useUseCase } from '../../hooks/useUseCase';
import { EntityReducerMap } from '@mic-rexjs/usecases';

export const UseCaseFragment = <T, TEntityReducers extends EntityReducerMap<T>>({
  usecase,
  watch,
  onChange,
}: UseCaseFragmentProps<T, TEntityReducers>): React.ReactElement => {
  void useUseCase(usecase, { watch, onChange });

  return <Fragment />;
};
