import { relative } from "node:path/posix";

import { flatMap } from "@auaust/primitive-kit/arrays";

import { resolveListOption } from "#config/utils/resolveListOption";
import { resolveTsconfigEnvironments } from "#typescript/utils/resolveTsconfigEnvironments";
import { toTsconfigGlobs } from "#typescript/utils/toTsconfigGlobs";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { TsconfigKey } from "#config/types/TsconfigKey";
import type { JsonEdit } from "#support/json/types/JsonEdit";
import type { File } from "#types/File";
import type { TsconfigTarget } from "#typescript/types/TsconfigTarget";

function listDefaultInclude(
  config: ResolvedConfig,
  key: TsconfigKey,
  file: File,
): readonly string[] {
  const { owner, environments } = resolveTsconfigEnvironments(config, key);

  const globs = flatMap(environments, (name) => config[name].globs);

  const included = config[owner].defines
    ? [...globs, relative(config.root, config.typescript.envFile)]
    : globs;

  return toTsconfigGlobs(file, included);
}

export function produceTsconfigInclude(
  config: ResolvedConfig,
  { key, file, include: option }: TsconfigTarget,
): readonly JsonEdit[] {
  if (key === "base") {
    return [];
  }

  const include = resolveListOption(
    option,
    () => listDefaultInclude(config, key, file),
    `${key}.tsconfig.include`,
  );

  return include === false ? [] : [{ path: ["include"], value: [...include] }];
}
