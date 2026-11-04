import { relative } from "node:path/posix";

import { flatMap } from "@auaust/primitive-kit/arrays";

import { resolveListOption } from "#project/config/operations/resolveListOption";
import { resolveTsconfigEnvironments } from "#project/tsconfig/operations/resolveTsconfigEnvironments";
import { toTsconfigGlobs } from "#project/tsconfig/utils/toTsconfigGlobs";
import type { JsonEdit } from "#foundation/json/types/JsonEdit";
import type { ResolvedConfig } from "#project/config/types/ResolvedConfig";
import type { TsconfigKey } from "#project/tsconfig/types/TsconfigKey";
import type { TsconfigTarget } from "#project/tsconfig/types/TsconfigTarget";
import type { File } from "#types/File";

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
