// @debt stands in for toolkit's `isString`, kept out so the hook loads only Node builtins
export function isText(value: unknown): value is string {
  return String(value) === value;
}
