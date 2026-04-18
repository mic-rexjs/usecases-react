import { Fragment } from 'react';
import { UseCaseFragmentProps } from './types';
import { useUseCase } from '../../hooks/useUseCase';
import { EntityReducerMap } from '@mic-rexjs/usecases/es/types';
import { useMount } from 'ahooks';

export const UseCaseFragment = <T, TEntityReducers extends EntityReducerMap<T>>({
  usecase,
  watch,
  onMount,
  onChange,
}: UseCaseFragmentProps<T, TEntityReducers>): React.ReactElement => {
  const [entity] = useUseCase(usecase, { watch, onChange });

  useMount((): void => {
    onMount?.(entity);
  });

  return <Fragment />;
};
