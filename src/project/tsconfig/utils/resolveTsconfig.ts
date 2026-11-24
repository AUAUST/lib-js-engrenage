import { freeze } from "@auaust/toolkit/object";

import type { ResolvedEnvironmentTsconfigOption } from "#project/tsconfig/types/ResolvedEnvironmentTsconfigOption";

export function resolveTsconfig(option: ResolvedEnvironmentTsconfigOption) {
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

  return freeze({
    file: option.path.file,
    location: option.path,
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
