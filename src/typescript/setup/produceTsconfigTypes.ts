import { resolveListOption } from "#config/utils/resolveListOption";
import { resolveTsconfigRuntime } from "#typescript/utils/resolveTsconfigRuntime";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { TsconfigKey } from "#config/types/TsconfigKey";
import type { JsonEdit } from "#support/json/types/JsonEdit";
import type { TsconfigTarget } from "#typescript/types/TsconfigTarget";

function listDefaultTypes(
  config: ResolvedConfig,
  key: TsconfigKey,
): readonly string[] {
  return resolveTsconfigRuntime(config, key).kind === "node" ? ["node"] : [];
}

export function produceTsconfigTypes(
  config: ResolvedConfig,
  { key, types: option }: TsconfigTarget,
): readonly JsonEdit[] {
  if (key === "base") {
    return [];
  }

  const types = resolveListOption(
    option,
    () => listDefaultTypes(config, key),
    `${key}.tsconfig.types`,
  );

  return types === false
    ? []
    : [{ path: ["compilerOptions", "types"], value: [...types] }];
}
