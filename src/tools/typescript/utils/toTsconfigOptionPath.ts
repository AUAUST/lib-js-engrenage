import type { TsconfigKey } from "#project/tsconfig/index";

/**
 * The config path of the tsconfig option of `key`: `tests.dist.tsconfig` for the
 * variant, `environments.<key>.tsconfig` for a registration.
 */
export function toTsconfigOptionPath(key: TsconfigKey): string {
  return key === "tests.dist"
    ? "tests.dist.tsconfig"
    : `environments.${key}.tsconfig`;
}
