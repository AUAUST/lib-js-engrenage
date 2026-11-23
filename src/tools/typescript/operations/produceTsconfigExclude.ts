import { isNonEmptyArray } from "@auaust/toolkit/array";

import { rootScope } from "#batiment/scopes/constants";
import { resolveListOption } from "#foundation/options/index";
import {
  toTsconfigGlobs,
  type TsconfigKey,
  type TsconfigTarget,
} from "#project/tsconfig/index";
import { resolveTsconfigEnvironments } from "#tools/typescript/operations/resolveTsconfigEnvironments";
import type { JsonEdit } from "#foundation/json/index";
import type { LoadedConfig } from "#project/config/index";
import type { File } from "#types/File";

async function listNestedPlacements(
  config: LoadedConfig,
  names: readonly string[],
): Promise<readonly string[]> {
  const context = await config.resolve("structure.context");

  const { environments } = await context.discover();

  return environments.instances
    .filter(({ environment, scope }) => {
      return scope === rootScope && names.includes(environment);
    })
    .flatMap(({ nested }) => nested)
    .filter(({ environment }) => !names.includes(environment))
    .map(({ dir }) => `${dir}/**`);
}

async function createDefaultExclude(
  config: LoadedConfig,
  key: TsconfigKey,
  file: File,
): Promise<() => readonly string[]> {
  const { environments } = await resolveTsconfigEnvironments(config, key);

  const includesTests = environments.includes("tests");

  const { fixtures } = await config.resolve("files");

  const nested = await listNestedPlacements(config, environments);

  return () => {
    return toTsconfigGlobs(file, [
      ...(includesTests ? fixtures : []),
      ...nested,
    ]);
  };
}

export async function produceTsconfigExclude(
  config: LoadedConfig,
  { key, file, exclude: option }: TsconfigTarget,
): Promise<readonly JsonEdit[]> {
  if (key === "base") {
    return [];
  }

  const exclude = resolveListOption(
    option,
    await createDefaultExclude(config, key, file),
    `${key}.tsconfig.exclude`,
    config.context.reporter,
  );

  const isDefault = option == null || option === true;

  if (exclude === false || (!isNonEmptyArray(exclude) && isDefault)) {
    return [];
  }

  return [{ path: ["exclude"], value: [...exclude] }];
}
