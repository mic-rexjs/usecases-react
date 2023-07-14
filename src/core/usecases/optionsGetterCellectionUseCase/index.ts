import { OptionsGetter, OptionsGetterCollectionReducers } from './types';

export const optionsGetterCollectionUseCase = <T>(
  collection: OptionsGetter<T>[]
): OptionsGetterCollectionReducers<T> => {
  const addOptionsGetter = (getter: OptionsGetter<T>): void => {
    collection.unshift(getter);
  };

  const removeOptionsGetter = (getter: OptionsGetter<T>): void => {
    const index = collection.indexOf(getter);

    if (index === -1) {
      return;
    }

    collection.splice(index, 1);
  };

  return { addOptionsGetter, removeOptionsGetter };
};
