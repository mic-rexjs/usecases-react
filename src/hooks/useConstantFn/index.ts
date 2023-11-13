import { useState } from 'react';

export const useConstantFn = <T>(initialValue: T): T => {
  const [value] = useState((): T => {
    return initialValue;
  });

  return value;
};
