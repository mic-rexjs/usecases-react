import { Reducers } from '@mic-rexjs/usecases';

export interface LifecycleEvents<T = unknown> {
  /**
   * 在渲染组件阶段触发：
   *
   * 第一次初始化，将 `entity` 与 `reducers` 相绑定的时候触发，仅一次。
   */
  onBind(entity: T): void;

  /**
   * `unmount` 的时候触发。
   */
  onUnbind(entity: T): void;

  /**
   * 非渲染阶段触发，随后会触发组件的更新：
   *
   * 只由相关 `reducers` 的调用行为触发；
   * 不包括 `useUseCase(entity, usecase)` 中的 `entity` 变化触发。
   */
  onChange(newEntity: T, oldEntity: T): void;

  /**
   * 触发机制包括以下两点：
   *
   * 1. 由相关 `reducers` 的调用行为触发 - 非渲染阶段；
   * 2. 由 `useUseCase(entity, usecase)` 中的 `entity` 变化触发 - 渲染阶段。
   */
  onUpdate(newEntity: T, oldEntity: T): void;
}

export interface CaptureLifecycleEventsCallback<T> {
  (): T;
}

export type LifecycleEventReducers = Reducers<{
  deleteLifecycleEvents(key: React.Key): boolean;

  bindLifecycleEventsKey<T>(key: React.Key): Partial<LifecycleEvents<T>>;

  setLifecycleEvents<T>(events: Partial<LifecycleEvents<T>>): void;

  getLifecycleEvents<T>(key: React.Key): Partial<LifecycleEvents<T>>;
}>;
