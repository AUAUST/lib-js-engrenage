import type { TsconfigKey } from "#project/tsconfig/index";

/**
 * The environment whose files the tsconfig of `key` checks: `tests` for
 * `tests.dist`, the environment named `key` otherwise.
 */
export function toTsconfigEnvironment(key: TsconfigKey): string {
  // @debt producers compute tests.dist fields as if it were tests, and syncTsconfigFiles then drops the ones it inherits; knowing which fields a variant inherits here would let producers skip them directly
  return key === "tests.dist" ? "tests" : key;
}
