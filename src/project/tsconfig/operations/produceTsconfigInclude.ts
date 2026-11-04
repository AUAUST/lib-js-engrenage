import { relative } from "node:path/posix";

import { flatMap } from "@auaust/primitive-kit/arrays";

import { resolveListOption } from "#config/operations/resolveListOption";
import { resolveTsconfigEnvironments } from "#tsconfig/operations/resolveTsconfigEnvironments";
import { toTsconfigGlobs } from "#tsconfig/utils/toTsconfigGlobs";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { JsonEdit } from "#json/types/JsonEdit";
import type { TsconfigKey } from "#tsconfig/types/TsconfigKey";
import type { TsconfigTarget } from "#tsconfig/types/TsconfigTarget";
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
