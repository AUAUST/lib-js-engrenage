import { relative } from "node:path/posix";

import { flatMap } from "@auaust/primitive-kit/arrays";

import { resolveListOption } from "#foundation/options/index";
import { resolveTsconfigEnvironments } from "#project/tsconfig/operations/resolveTsconfigEnvironments";
import { toTsconfigGlobs } from "#project/tsconfig/utils/toTsconfigGlobs";
import type { JsonEdit } from "#foundation/json/index";
import type { ConfigContext } from "#project/config/index";
import type { TsconfigKey } from "#project/tsconfig/types/TsconfigKey";
import type { TsconfigTarget } from "#project/tsconfig/types/TsconfigTarget";
import type { File } from "#types/File";

async function createDefaultInclude(
  config: ConfigContext,
  key: TsconfigKey,
  file: File,
): Promise<() => readonly string[]> {
  const { owner, environments } = await resolveTsconfigEnvironments(
    config,
    key,
  );

  const resolved = await Promise.all(
    environments.map((name) => config.get(name)),
  );

  const { defines } = await config.get(owner);
  const root = await config.get("root");
  const { envFile } = await config.get("typescript");

  return () => {
    const globs = flatMap(resolved, ({ globs }) => globs);

    const included = defines ? [...globs, relative(root, envFile)] : globs;

    return toTsconfigGlobs(file, included);
  };
}

export async function produceTsconfigInclude(
  config: ConfigContext,
  { key, file, include: option }: TsconfigTarget,
): Promise<readonly JsonEdit[]> {
  if (key === "base") {
    return [];
  }

  const include = resolveListOption(
    option,
    await createDefaultInclude(config, key, file),
    `${key}.tsconfig.include`,
  );

  return include === false ? [] : [{ path: ["include"], value: [...include] }];
}
