import { resolveListOption } from "#config/utils/resolveListOption";
import { readRuntimePreset } from "#typescript/utils/readRuntimePreset";
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

  const library = resolveListOption(
    option,
    () => readRuntimePreset(resolveTsconfigRuntime(config, key)).lib,
    `${key}.tsconfig.lib`,
  );

  return library === false
    ? []
    : [{ path: ["compilerOptions", "lib"], value: [...library] }];
}
