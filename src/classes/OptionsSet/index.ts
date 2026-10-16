import { EventParameters, EventReturnType } from './types';

export class OptionsSet<T = object> extends Set<T> {
  #rootOptions: T | null = null;

  add(options: T, root?: boolean): this {
    if (typeof options !== 'object') {
      return this;
    }

    if (root) {
      this.#rootOptions = options;
    }

    super.add(options);
    return this;
  }

  apply<K extends keyof T, TThis>(
    type: K,
    thisArgument: TThis,
    argumentsList: EventParameters<T[K]>,
  ): EventReturnType<T[K]> {
    let returnValue: EventReturnType<T[K]> | undefined;
    const rootOptions = this.#rootOptions;
    const { [type]: rootEvent } = rootOptions || {};

    if (typeof rootEvent === 'function') {
      // 最先调用根节点的事件
      returnValue = Reflect.apply(rootEvent, thisArgument, argumentsList);
    }

    for (const options of this) {
      if (options === rootOptions) {
        continue;
      }

      const { [type]: event } = options;

      if (typeof event !== 'function') {
        continue;
      }

      // 非根节点事件，不处理返回值
      Reflect.apply(event, thisArgument, argumentsList);
    }

    return returnValue as EventReturnType<T[K]>;
  }
}
