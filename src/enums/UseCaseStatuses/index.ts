export enum UseCaseStatuses {
  None = 0b0,

  // 是否需要初始化根 `redurcers`
  RootEnabled = 0b10 ** 1,

  // 是否为上下文模式
  ContextEnabled = 0b10 ** 2,

  // 是否有 `entity`
  EntityEnabled = 0b10 ** 3,

  // 是否为需要提供 `Provider` 去挂载根 `context`
  ContextRootEnabled = ContextEnabled | RootEnabled | (0b10 ** 4),

  // 是否初始化与 `entity` 相关的 `reducers`
  EntityRootEnabled = EntityEnabled | ContextRootEnabled | (0b10 ** 5),

  // 是否不需要 `entity` 状态管理
  StatelessEnabled = EntityEnabled | (0b10 ** 6),
}
