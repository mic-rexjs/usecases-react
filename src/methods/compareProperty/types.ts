export interface ComparePropertyCallback {
  <T, S>(fromValue: T, toValue: S, fieldPaths: string[]): void;
}
