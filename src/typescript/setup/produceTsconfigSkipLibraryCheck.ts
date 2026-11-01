import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { JsonEdit } from "#support/json/types/JsonEdit";
import type { TsconfigTarget } from "#typescript/types/TsconfigTarget";

export function produceTsconfigSkipLibraryCheck(
  _config: ResolvedConfig,
  { key }: TsconfigTarget,
): readonly JsonEdit[] {
  return key === "tests.dist"
    ? [{ path: ["compilerOptions", "skipLibCheck"], value: false }]
    : [];
}
