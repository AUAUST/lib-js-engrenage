import { relative } from "node:path/posix";

import { flatMap } from "@auaust/primitive-kit/arrays";

import { resolveListOption } from "#foundation/options/index";
import {
  toTsconfigGlobs,
  typescriptSection,
  type TsconfigKey,
  type TsconfigTarget,
} from "#project/tsconfig/index";
import { resolveTsconfigEnvironment } from "#tools/typescript/operations/resolveTsconfigEnvironment";
import { resolveTsconfigEnvironments } from "#tools/typescript/operations/resolveTsconfigEnvironments";
import type { JsonEdit } from "#foundation/json/index";
import type { LoadedConfig } from "#project/config/index";
import type { File } from "#types/File";

async function createDefaultInclude(
  config: LoadedConfig,
  key: TsconfigKey,
  file: File,
): Promise<() => readonly string[]> {
  const { owner, environments } = await resolveTsconfigEnvironments(
    config,
    key,
  );

  const resolved = await Promise.all(
    environments.map((name) => resolveTsconfigEnvironment(config, name)),
  );

  const { defines } = await resolveTsconfigEnvironment(config, owner);
  const root = config.context.root;
  const { envFile } = await config.resolve(typescriptSection);

  return () => {
    const globs = flatMap(resolved, ({ globs }) => globs);

    const included = defines ? [...globs, relative(root, envFile)] : globs;

    return toTsconfigGlobs(file, included);
  };
}

export async function produceTsconfigInclude(
  config: LoadedConfig,
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
