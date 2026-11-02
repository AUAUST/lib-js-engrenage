import { resolveListOption } from "#config/utils/resolveListOption";
import { readTsconfigValue } from "#typescript/utils/readTsconfigValue";
import { resolveTsconfigRuntime } from "#typescript/utils/resolveTsconfigRuntime";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { JsonEdit } from "#support/json/types/JsonEdit";
import type { TsconfigTarget } from "#typescript/types/TsconfigTarget";

export function produceTsconfigLibrary(
  config: ResolvedConfig,
  target: TsconfigTarget,
): readonly JsonEdit[] {
  const { key, lib: option } = target;

  if (key === "base") {
    return [];
  }

  const runtime = resolveTsconfigRuntime(config, key);

  if (runtime?.kind === "baseline") {
    if (option != null && option !== true) {
      throw new Error(
        `${key}.tsconfig.lib is not accepted for a baseline runtime: noLib makes every lib invalid, its built-ins come from typescript-baseline-lib, and ${key}.tsconfig.types lists further declarations such as @types/web`,
      );
    }

    return [
      { path: ["compilerOptions", "noLib"], value: true },
      { path: ["compilerOptions", "lib"], value: null },
    ];
  }

  const removeNoLibrary: JsonEdit = {
    path: ["compilerOptions", "noLib"],
    value: undefined,
  };

  if (runtime === undefined && (option == null || option === true)) {
    return readTsconfigValue(config, target, ["compilerOptions", "lib"]) ===
      null
      ? [removeNoLibrary, { path: ["compilerOptions", "lib"], value: undefined }]
      : [removeNoLibrary];
  }

  const library = resolveListOption(
    option,
    () => ["ESNext"],
    `${key}.tsconfig.lib`,
  );

  return library === false
    ? [removeNoLibrary]
    : [removeNoLibrary, { path: ["compilerOptions", "lib"], value: [...library] }];
}
