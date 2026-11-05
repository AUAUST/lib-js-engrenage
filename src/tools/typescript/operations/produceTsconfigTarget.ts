import type { JsonEdit } from "#foundation/json/index";
import type { LoadedConfig } from "#project/config/index";
import type { TsconfigTarget } from "#project/tsconfig/index";

export function produceTsconfigTarget(
  _config: LoadedConfig,
  { key }: TsconfigTarget,
): readonly JsonEdit[] {
  if (key === "base") {
    return [];
  }

  return [{ path: ["compilerOptions", "target"], value: "ESNext" }];
}
