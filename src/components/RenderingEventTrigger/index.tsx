import { RenderingEventTriggerProps } from './types';
import { Fragment } from 'react';

export const RenderingEventTrigger = ({ onRendering }: RenderingEventTriggerProps): React.ReactElement => {
  onRendering?.();
  return <Fragment />;
};
