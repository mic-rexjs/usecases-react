import { useState } from 'react';
import { ConstantInitializer } from './types';

export const useConstant = <T>(initialValue: T | ConstantInitializer<T>): T => {
  const [value] = useState(initialValue);

  return value;
};
