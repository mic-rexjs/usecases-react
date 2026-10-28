export enum Statuses {
  None = 0b0,

  /**
   * 是否启用 `entity`
   */
  Entity = 0b10 ** 2,

  /**
   * 是否以 `ReducersHook` 或 `RootCoreCollectionHook` 的形式被调用
   */
  RootRuntime = 0b10 ** 3,

  /**
   * 是否以 `RootCoreCollectionHook` 的形式被调用
   */
  EntityRootRuntime = Entity | RootRuntime,

  /**
   * 是否以 `ContextualCoreCollectionHook` 的形式被调用
   */
  EntityContextRuntime = (0b10 ** 4) | Entity,

  /**
   * 当传入的 `entity` 参数变更时，状态会轮流切换到 `X` 或 `Y` 其中的一个。
   */
  InitialEntityX = 0b10 ** 5,

  /**
   * 当传入的 `entity` 参数变更时，状态会轮流切换到 `X` 或 `Y` 其中的一个。
   */
  InitialEntityY = 0b10 ** 6,

  /**
   * 当传入的 `entity` 参数变更时，生成相关的 `key`，可作为 `hooks` 的依赖。
   *
   * 使用方式：
   * * `const entityKey = statuses & Statuses.EntityKey;`
   */
  InitialEntityKey = InitialEntityX | InitialEntityY,

  /**
   * 当传入的 `usecase` 参数变更时，状态会轮流切换到 `X` 或 `Y` 其中的一个。
   */
  UseCaseX = 0b10 ** 7,

  /**
   * 当传入的 `usecase` 参数变更时，状态会轮流切换到 `X` 或 `Y` 其中的一个。
   */
  UseCaseY = 0b10 ** 8,

  /**
   * 当传入的 `usecase` 参数变更时，生成相关的 `key`，可作为 `hooks` 的依赖。
   *
   * 使用方式：
   * * `const usecaseKey = statuses & Statuses.UseCaseKey;`
   */
  UseCaseKey = UseCaseX | UseCaseY,

  /**
   * 当传入的 `deps` 变更时，状态会轮流切换到 `X` 或 `Y` 其中的一个。
   */
  DepsX = 0b10 ** 9,

  /**
   * 当传入的 `deps` 变更时，状态会轮流切换到 `X` 或 `Y` 其中的一个。
   */
  DepsY = 0b10 ** 10,

  /**
   * 当传入的 `deps` 变更时，生成相关的 `key`，可作为 `hooks` 的依赖。
   *
   * 使用方式：
   * * `const depsKey = statuses & Statuses.DepsKey;`
   */
  DepsKey = DepsX | DepsY,

  /**
   * 当传入的 `usecase` 或 `deps` 参数变更时，状态会轮流切换到 `X` 或 `Y` 其中的一个；
   * 表示将有新的 `reducers` 将会生成。
   */
  ReducersX = 0b10 ** 11,

  /**
   * 当传入的 `usecase` 或 `deps` 参数变更时，状态会轮流切换到 `X` 或 `Y` 其中的一个；
   * 表示将有新的 `reducers` 将会生成。
   */
  ReducersY = 0b10 ** 12,

  /**
   * 当传入的 `usecase` 或 `deps` 参数变更时，生成相关的 `key`，可作为 `hooks` 的依赖。
   *
   * 使用方式：
   * * `const reducersKey = statuses & Statuses.ReducersKey;`
   */
  ReducersKey = ReducersX | ReducersY,

  /**
   * 以下情况变更时，状态会轮流切换到 `X` 或 `Y` 其中的一个：
   * * 传入的 `usecase` 发生变化；
   * * 调用 `useUseCase` 的形式发生变化；
   * * 新增或移除根节点的 `Provider`；
   */
  RootX = 0b10 ** 13,

  /**
   * 以下情况变更时，状态会轮流切换到 `X` 或 `Y` 其中的一个：
   * * 传入的 `usecase` 发生变化；
   * * 调用 `useUseCase` 的形式发生变化；
   * * 新增或移除根节点的 `Provider`；
   */
  RootY = 0b10 ** 14,

  /**
   * 根据 `root` 的变化，生成相关的 `key`，可作为 `hooks` 的依赖。
   */
  RootKey = RootX | RootY,
}
