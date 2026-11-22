// @debt stands in for toolkit's `isFinite`, kept out so the hook loads only Node builtins
export function isFiniteNumber(value: unknown): value is number {
  return Number.isFinite(value);
}
