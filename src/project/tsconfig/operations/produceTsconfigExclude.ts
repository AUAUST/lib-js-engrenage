import { isNotEmpty } from "@auaust/primitive-kit/arrays";

import { resolveListOption } from "#project/config/operations/resolveListOption";
import { resolveTsconfigEnvironments } from "#project/tsconfig/operations/resolveTsconfigEnvironments";
import { toTsconfigGlobs } from "#project/tsconfig/utils/toTsconfigGlobs";
import type { JsonEdit } from "#foundation/json/types/JsonEdit";
import type { ProjectConfig } from "#project/config/types/ProjectConfig";
import type { TsconfigKey } from "#project/tsconfig/types/TsconfigKey";
import type { TsconfigTarget } from "#project/tsconfig/types/TsconfigTarget";
import type { File } from "#types/File";

function listDefaultExclude(
  config: ProjectConfig,
  key: TsconfigKey,
  file: File,
): readonly string[] {
  const { environments } = resolveTsconfigEnvironments(config, key);

  const includesTests = environments.includes("tests");

  return includesTests ? toTsconfigGlobs(file, config.files.fixtures) : [];
}

export function produceTsconfigExclude(
  config: ProjectConfig,
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
