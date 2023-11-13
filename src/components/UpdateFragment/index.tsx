import { Fragment, useEffect } from 'react';
import { UpdateFragmentProps } from './types';

export const UpdateFragment = ({ onUpdate }: UpdateFragmentProps): React.ReactElement => {
  useEffect((): void => {
    onUpdate?.();
  });

  return <Fragment />;
};
