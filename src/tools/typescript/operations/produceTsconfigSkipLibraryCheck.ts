import type { JsonEdit } from "#foundation/json/index";
import type { LoadedConfig } from "#project/config/index";
import type { TsconfigTarget } from "#project/tsconfig/index";

export function produceTsconfigSkipLibraryCheck(
  _config: LoadedConfig,
  { key }: TsconfigTarget,
): readonly JsonEdit[] {
  return key === "tests.dist"
    ? [{ path: ["compilerOptions", "skipLibCheck"], value: false }]
    : [];
}
