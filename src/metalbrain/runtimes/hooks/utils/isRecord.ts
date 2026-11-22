// @debt stands in for toolkit's `isObject`, kept out so the hook loads only Node builtins
export function isRecord(value: unknown): value is Record<string, unknown> {
  return value instanceof Object && !Array.isArray(value);
}
