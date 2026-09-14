import { LifecycleEventReducers, LifecycleEvents } from './types';
import { createUseCase, UseCase } from '@mic-rexjs/usecases';

export const lifecycleEventUseCase = createUseCase((): UseCase<LifecycleEventReducers> => {
  const map = new Map();
  let events: Partial<LifecycleEvents> | null = null;

  /**
   * 逻辑是：先存，再绑定 `key`，再通过 `key` 获取，最后清除
   */
  return (): LifecycleEventReducers => {
    const deleteLifecycleEvents = (key: React.Key): boolean => {
      return map.delete(key);
    };

    const bindLifecycleEventsKey = <T>(key: React.Key): Partial<LifecycleEvents<T>> => {
      if (events === null) {
        return {};
      }

      const currentEvents = events;

      events = null;
      map.set(key, currentEvents);
      return currentEvents;
    };

    const getLifecycleEvents = <T>(key: React.Key): Partial<LifecycleEvents<T>> => {
      return map.get(key) || {};
    };

    const setLifecycleEvents = <T>(e: Partial<LifecycleEvents<T>>): void => {
      events = e;
    };

    return {
      deleteLifecycleEvents,
      setLifecycleEvents,
      getLifecycleEvents,
      bindLifecycleEventsKey,
    };
  };
});
