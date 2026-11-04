import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { JsonEdit } from "#json/types/JsonEdit";
import type { TsconfigTarget } from "#tsconfig/types/TsconfigTarget";

export function produceTsconfigSkipLibraryCheck(
  _config: ResolvedConfig,
  { key }: TsconfigTarget,
): readonly JsonEdit[] {
  return key === "tests.dist"
    ? [{ path: ["compilerOptions", "skipLibCheck"], value: false }]
    : [];
}
