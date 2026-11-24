import { isNonEmptyArray } from "@auaust/toolkit/array";

import { rootScope } from "#batiment/scopes/constants";
import { resolveListOption } from "#foundation/options/index";
import {
  toTsconfigGlobs,
  type TsconfigKey,
  type TsconfigTarget,
} from "#project/tsconfig/index";
import { toTsconfigEnvironment } from "#tools/typescript/utils/toTsconfigEnvironment";
import { toTsconfigOptionPath } from "#tools/typescript/utils/toTsconfigOptionPath";
import type { JsonEdit } from "#foundation/json/index";
import type { LoadedConfig } from "#project/config/index";
import type { File } from "#types/File";

async function listNestedPlacements(
  config: LoadedConfig,
  name: string,
): Promise<readonly string[]> {
  const context = await config.resolve("structure.context");

  const { environments } = await context.discover();

  return environments.instances
    .filter(({ environment, scope }) => {
      return scope === rootScope && environment === name;
    })
    .flatMap(({ nested }) => nested)
    .filter(({ environment }) => environment !== name)
    .map(({ dir }) => `${dir}/**`);
}

async function createDefaultExclude(
  config: LoadedConfig,
  key: TsconfigKey,
  file: File,
): Promise<() => readonly string[]> {
  const name = toTsconfigEnvironment(key);

  const { fixtures } = await config.resolve("files");

  const nested = await listNestedPlacements(config, name);

  return () => {
    return toTsconfigGlobs(file, [
      ...(name === "tests" ? fixtures : []),
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
    `${toTsconfigOptionPath(key)}.exclude`,
    config.context.reporter,
  );

  const isDefault = option == null || option === true;

  if (exclude === false || (!isNonEmptyArray(exclude) && isDefault)) {
    return [];
  }

  return [{ path: ["exclude"], value: [...exclude] }];
}
