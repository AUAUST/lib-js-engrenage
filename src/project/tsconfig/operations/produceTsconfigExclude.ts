import { isNotEmpty } from "@auaust/primitive-kit/arrays";

import { resolveListOption } from "#config/operations/resolveListOption";
import { resolveTsconfigEnvironments } from "#tsconfig/operations/resolveTsconfigEnvironments";
import { toTsconfigGlobs } from "#tsconfig/utils/toTsconfigGlobs";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { JsonEdit } from "#json/types/JsonEdit";
import type { TsconfigKey } from "#tsconfig/types/TsconfigKey";
import type { TsconfigTarget } from "#tsconfig/types/TsconfigTarget";
import type { File } from "#types/File";

function listDefaultExclude(
  config: ResolvedConfig,
  key: TsconfigKey,
  file: File,
): readonly string[] {
  const { environments } = resolveTsconfigEnvironments(config, key);

  const includesTests = environments.includes("tests");

  return includesTests ? toTsconfigGlobs(file, config.files.fixtures) : [];
}

export function produceTsconfigExclude(
  config: ResolvedConfig,
  { key, file, exclude: option }: TsconfigTarget,
): readonly JsonEdit[] {
  if (key === "base") {
    return [];
  }

  const exclude = resolveListOption(
    option,
    () => listDefaultExclude(config, key, file),
    `${key}.tsconfig.exclude`,
  );

  const isDefault = option == null || option === true;

  if (exclude === false || (!isNotEmpty(exclude) && isDefault)) {
    return [];
  }

  return [{ path: ["exclude"], value: [...exclude] }];
}
