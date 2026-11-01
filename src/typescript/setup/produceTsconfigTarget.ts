import { readRuntimePreset } from "#typescript/utils/readRuntimePreset";
import { resolveTsconfigRuntime } from "#typescript/utils/resolveTsconfigRuntime";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { JsonEdit } from "#support/json/types/JsonEdit";
import type { TsconfigTarget } from "#typescript/types/TsconfigTarget";

export function produceTsconfigTarget(
  config: ResolvedConfig,
  { key }: TsconfigTarget,
): readonly JsonEdit[] {
  if (key === "base") {
    return [];
  }

  const { target } = readRuntimePreset(resolveTsconfigRuntime(config, key));

  return [{ path: ["compilerOptions", "target"], value: target }];
}
