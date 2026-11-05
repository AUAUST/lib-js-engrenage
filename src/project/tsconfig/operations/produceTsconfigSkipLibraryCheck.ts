import type { JsonEdit } from "#foundation/json/index";
import type { ProjectConfig } from "#project/config/index";
import type { TsconfigTarget } from "#project/tsconfig/types/TsconfigTarget";

export function produceTsconfigSkipLibraryCheck(
  _config: ProjectConfig,
  { key }: TsconfigTarget,
): readonly JsonEdit[] {
  return key === "tests.dist"
    ? [{ path: ["compilerOptions", "skipLibCheck"], value: false }]
    : [];
}
