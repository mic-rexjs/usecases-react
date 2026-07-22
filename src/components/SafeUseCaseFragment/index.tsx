import { useUseCase } from '../../hooks/useUseCase';
import { SafeUseCaseFragmentProps } from './types';
import { EntityReducerMap } from '@mic-rexjs/usecases/es/types';
import { useMemoizedFn, useMount, useUpdateEffect } from 'ahooks';
import { Fragment } from 'react';

export const SafeUseCaseFragment = <T, TEntityReducers extends EntityReducerMap<T>>({
  usecase,
  watch,
  onMount,
  onUpdate,
  onChange,
}: SafeUseCaseFragmentProps<T, TEntityReducers>): React.ReactElement => {
  const [entity] = useUseCase(usecase, { watch, onChange });

  const onEntityUpdate = useMemoizedFn((): void => {
    onUpdate?.(entity);
  });

  useMount((): void => {
    onMount?.(entity);
  });

  useUpdateEffect((): void => {
    onEntityUpdate();
  }, [entity, onEntityUpdate]);

  return <Fragment />;
};
