import { isBoolean } from "@auaust/toolkit/isBoolean";

import { resolveListOption } from "#config/utils/resolveListOption";
import { resolveTsconfigRuntime } from "#typescript/utils/resolveTsconfigRuntime";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { JsonEdit } from "#support/json/types/JsonEdit";
import type { TsconfigTarget } from "#typescript/types/TsconfigTarget";

export function produceTsconfigLibrary(
  config: ResolvedConfig,
  { key, lib: option }: TsconfigTarget,
): readonly JsonEdit[] {
  if (key === "base") {
    return [];
  }

  if (resolveTsconfigRuntime(config, key).kind === "baseline") {
    if (option !== undefined && !isBoolean(option)) {
      throw new Error(
        `${key}.tsconfig.lib is not accepted for a baseline runtime: its built-ins come from typescript-baseline-lib, and ${key}.tsconfig.types lists further declarations such as @types/web`,
      );
    }

    // @debt with `lib: false` the lib reset is left alone while noLib is still set, so a lib kept in the file fails tsc with TS5053 instead of a clear sync error
    return [
      { path: ["compilerOptions", "noLib"], value: true },
      { path: ["compilerOptions", "lib"], value: null },
    ];
  }

  const library = resolveListOption(
    option,
    () => ["ESNext"],
    `${key}.tsconfig.lib`,
  );

  return library === false
    ? []
    : [{ path: ["compilerOptions", "lib"], value: [...library] }];
}
