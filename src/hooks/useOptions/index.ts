import { useExec } from '../useExec';
import { useRootCreation } from '../useRootCreation';
import { ContextualUseCaseHookOptions, UseCaseHookOptions } from '../useUseCase/types';
import { OptionsHookResult } from './types';
import { OptionsSet } from '@/classes/OptionsSet';
import { EventParameters, EventReturnType } from '@/classes/OptionsSet/types';
import { Statuses } from '@/enums/Statuses';
import { Dependencies } from '@/types';

export const useOptions = <T, TOptions extends object>(
  options: TOptions,
  optionsSet: OptionsSet<TOptions>,
  statuses: Statuses,
  deps: Dependencies = [],
): OptionsHookResult<T, TOptions> => {
  const entityEnabled = (statuses & Statuses.EntityEnabled) === Statuses.EntityEnabled;
  const entityRootEnabled = (statuses & Statuses.EntityRootEnabled) === Statuses.EntityRootEnabled;
  const { watch, onChange, ...restOptions } = options as UseCaseHookOptions<T, TOptions>;
  const { options: propertyOptions = restOptions } = options as UseCaseHookOptions<T, TOptions>;
  const contextualOptions = propertyOptions as TOptions;
  const hookOptions: ContextualUseCaseHookOptions<T> = entityEnabled ? { watch, onChange } : {};

  const onProxyEvent = <K extends keyof TOptions>(propertyName: K): TOptions[K] => {
    return new Proxy(((): void => {}) as TOptions[K] & object, {
      apply<TThis>(
        fn: TOptions[K],
        thisArgument: TThis,
        argumentList: EventParameters<TOptions[K]>,
      ): EventReturnType<TOptions[K]> {
        return optionsSet.apply(propertyName, thisArgument, argumentList);
      },
    });
  };

  const onGet = <K extends keyof TOptions & (string | symbol)>(
    target: TOptions,
    propertyName: K,
    receiver: TOptions,
  ): TOptions[K] => {
    const isStringProperty = typeof propertyName === 'string';
    const isEvent = isStringProperty && /^on[A-Z]/.test(propertyName);

    if (!isEvent) {
      return Reflect.get(target, propertyName, receiver);
    }

    return onProxyEvent(propertyName);
  };

  const rootOptions = useRootCreation(
    statuses,
    (): TOptions => {
      return new Proxy(contextualOptions as TOptions, {
        get: onGet,
      });
    },
    true,
    deps,
  );

  const entityUseCaseOptions = rootOptions || contextualOptions;
  const usecaseOptions = entityEnabled ? entityUseCaseOptions : options;

  useExec(
    (): void => {
      if (!entityEnabled) {
        return;
      }

      optionsSet.add(contextualOptions, entityRootEnabled);
    },
    (): void => {
      optionsSet.delete(contextualOptions);
    },
  );

  return {
    hookOptions,
    usecaseOptions,
  };
};
