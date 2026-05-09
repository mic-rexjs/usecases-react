import { useUseCase } from '../../hooks/useUseCase';
import { SafeUseCaseFragmentProps } from './types';
import { EntityReducerMap } from '@mic-rexjs/usecases/es/types';
import { useMount } from 'ahooks';
import { Fragment } from 'react';

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
