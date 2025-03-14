export enum ArgumentTypes {
  None = 0b0,

  Entity = 0b10 ** 1,

  Global = 0b10 ** 2,

  GlobalEntity = Global | Entity,
}
