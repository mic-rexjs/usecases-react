export enum UseCaseModes {
  Normal = 0b10,

  Stateless = 0b10 ** 2,

  Global = 0b10 ** 3,

  StatelessGlobal = Stateless | Global,
}
