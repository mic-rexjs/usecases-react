export const hasField = <T>(data: T, field: string): boolean => {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  return Object.hasOwn(data, field);
};
