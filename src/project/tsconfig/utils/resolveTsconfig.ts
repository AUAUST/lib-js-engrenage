import { freeze } from "@auaust/toolkit/object";

import type { ResolvedEnvironmentTsconfigOption } from "#project/tsconfig/types/ResolvedEnvironmentTsconfigOption";
import type { TsconfigKey } from "#project/tsconfig/types/TsconfigKey";

/**
 * Flattens the tsconfig option of `key`, its unset `path` defaulting to
 * `tsconfig.<key>.json`.
 */
export function resolveTsconfig(
  key: TsconfigKey,
  option: ResolvedEnvironmentTsconfigOption,
) {
  if (!option.enabled) {
    return freeze({
      file: undefined,
      location: undefined,
      extends: undefined,
      include: undefined,
      exclude: undefined,
      lib: undefined,
      types: undefined,
      compilerOptions: {},
      unmanaged: [],
      check: false,
    });
  }

  const file = option.path ?? `tsconfig.${key}.json`;

  return freeze({
    file,
    location: { file, configured: option.path !== undefined },
    extends: option.extends,
    include: option.include,
    exclude: option.exclude,
    lib: option.lib,
    types: option.types,
    compilerOptions: option.compilerOptions,
    unmanaged: option.unmanaged,
    check: option.check,
  });
}
