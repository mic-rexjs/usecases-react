import { ConstantInitializer } from './types';
import { useState } from 'react';

export const useConstant = <T>(initialValue: T | ConstantInitializer<T>): T => {
  const [value] = useState(initialValue);

  return value;
};
