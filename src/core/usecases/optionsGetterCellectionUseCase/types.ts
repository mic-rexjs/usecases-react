import { Reducers } from '@mic-rexjs/usecases';

export interface OptionsGetter<T> {
  (): T;
}

export type OptionsGetterCollectionReducers<T> = Reducers<{
  addOptionsGetter(getter: OptionsGetter<T>): void;

  removeOptionsGetter(getter: OptionsGetter<T>): void;
}>;
