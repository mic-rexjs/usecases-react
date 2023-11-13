export const removeItem = <T>(list: T[], item: T): void => {
  const index = list.indexOf(item);

  if (index === -1) {
    return;
  }

  list.splice(index, 1);
};
