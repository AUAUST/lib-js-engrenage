import type { JsonEdit } from "#foundation/json/types/JsonEdit";
import type { ProjectConfig } from "#project/config/types/ProjectConfig";
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
