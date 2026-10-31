import { isNotEmpty, map } from "@auaust/primitive-kit/arrays";

import { resolveListOption } from "#config/utils/resolveListOption";
import { relativeToTsconfig } from "#typescript/utils/relativeToTsconfig";
import { resolveTsconfigEnvironments } from "#typescript/utils/resolveTsconfigEnvironments";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { TsconfigKey } from "#config/types/TsconfigKey";
import type { JsonEdit } from "#support/json/types/JsonEdit";
import type { File } from "#types/File";
import type { TsconfigTarget } from "#typescript/types/TsconfigTarget";

function listDefaultExclude(
  config: ResolvedConfig,
  key: TsconfigKey,
  file: File,
): readonly string[] {
  const { environments } = resolveTsconfigEnvironments(config, key);

  const includesTests = environments.includes("tests");

  return includesTests
    ? map(config.files.fixtures, (glob) => relativeToTsconfig(file, glob))
    : [];
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
