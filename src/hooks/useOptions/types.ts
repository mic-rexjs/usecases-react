import { ContextualUseCaseHookOptions } from '../useUseCase/types';

export interface OptionsHookResult<T, TOptions extends object> {
  hookOptions: ContextualUseCaseHookOptions<T>;

  usecaseOptions: TOptions;
}
