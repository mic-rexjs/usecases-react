import { Fragment } from 'react';
import { SafeUseCaseFragmentProps } from './types';
import { useUseCase } from '../../hooks/useUseCase';
import { EntityReducerMap } from '@mic-rexjs/usecases/es/types';
import { useMount } from 'ahooks';

export const SafeUseCaseFragment = <T, TEntityReducers extends EntityReducerMap<T>>({
  usecase,
  watch,
  onMount,
  onChange,
}: SafeUseCaseFragmentProps<T, TEntityReducers>): React.ReactElement => {
  const [entity] = useUseCase(usecase, { watch, onChange });

  useMount((): void => {
    onMount?.(entity);
  });

  return <Fragment />;
};
