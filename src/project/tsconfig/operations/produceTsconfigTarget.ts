import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { JsonEdit } from "#json/types/JsonEdit";
import type { TsconfigTarget } from "#tsconfig/types/TsconfigTarget";

export function produceTsconfigTarget(
  _config: ResolvedConfig,
  { key }: TsconfigTarget,
): readonly JsonEdit[] {
  if (key === "base") {
    return [];
  }

  return [{ path: ["compilerOptions", "target"], value: "ESNext" }];
}
