import { RestArguments } from '@mic-rexjs/usecases/es/types';

export type EventParameters<T> = T extends (...args: infer TArgs) => unknown ? TArgs : [];

export type EventReturnType<T> = T extends (...args: infer TArgs) => infer TTReturnType ? TTReturnType : void;

export type EventOptionKeys<T, K extends keyof T = keyof T> = K extends `on${Capitalize<string>}`
  ? NonNullable<T[K]> extends (...args: RestArguments) => unknown
    ? K
    : never
  : never;

export type VoidifyEventOption<T> = T extends (...args: infer TArgs) => unknown ? (...args: TArgs) => void : never;

export type VoidifyEventOptions<T> = {
  [K in keyof T as K extends EventOptionKeys<T> ? K : never]: VoidifyEventOption<T[K]>;
};
