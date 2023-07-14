import { Fragment } from 'react';
import { UseCaseFragmentProps } from './types';
import { EntityReducers } from '@rex-js/usecases/es/types';
import { useUseCase } from '../../hooks/useUseCase';

export const UseCaseFragment = <T, TReducers extends EntityReducers<T>>({
  usecase,
  watch,
  onChange,
}: UseCaseFragmentProps<T, TReducers>): React.ReactElement => {
  void useUseCase(usecase, { watch, onChange });

  return <Fragment />;
};
