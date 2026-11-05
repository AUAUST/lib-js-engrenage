import type { JsonEdit } from "#foundation/json/index";
import type { ProjectConfig } from "#project/config/index";
import type { TsconfigTarget } from "#project/tsconfig/types/TsconfigTarget";

export function produceTsconfigTarget(
  _config: ProjectConfig,
  { key }: TsconfigTarget,
): readonly JsonEdit[] {
  if (key === "base") {
    return [];
  }

  return [{ path: ["compilerOptions", "target"], value: "ESNext" }];
}
