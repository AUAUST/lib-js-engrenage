import type { JsonEdit } from "#foundation/json/types/JsonEdit";
import type { ProjectConfig } from "#project/config/types/ProjectConfig";
import type { TsconfigTarget } from "#project/tsconfig/types/TsconfigTarget";

export function produceTsconfigSkipLibraryCheck(
  _config: ProjectConfig,
  { key }: TsconfigTarget,
): readonly JsonEdit[] {
  return key === "tests.dist"
    ? [{ path: ["compilerOptions", "skipLibCheck"], value: false }]
    : [];
}
