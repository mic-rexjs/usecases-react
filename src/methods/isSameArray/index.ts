export const isSameArray = (array1: unknown[], array2: unknown[]): boolean => {
  const { length: length1 } = array1;
  const { length: length2 } = array2;

  if (length1 !== length2) {
    return false;
  }

  for (let i = 0; i < length1; i++) {
    if (array1[i] === array2[i]) {
      continue;
    }

    return false;
  }

  return true;
};
