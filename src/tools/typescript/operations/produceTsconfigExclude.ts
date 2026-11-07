import { isNotEmpty } from "@auaust/primitive-kit/arrays";

import { resolveListOption } from "#foundation/options/index";
import { filesSection } from "#project/structure/index";
import {
  toTsconfigGlobs,
  type TsconfigKey,
  type TsconfigTarget,
} from "#project/tsconfig/index";
import { resolveTsconfigEnvironments } from "#tools/typescript/operations/resolveTsconfigEnvironments";
import type { JsonEdit } from "#foundation/json/index";
import type { LoadedConfig } from "#project/config/index";
import type { File } from "#types/File";

async function createDefaultExclude(
  config: LoadedConfig,
  key: TsconfigKey,
  file: File,
): Promise<() => readonly string[]> {
  const { environments } = await resolveTsconfigEnvironments(config, key);

  const includesTests = environments.includes("tests");

  const { fixtures } = await config.resolve(filesSection);

  return () => {
    return includesTests ? toTsconfigGlobs(file, fixtures) : [];
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
  );

  const isDefault = option == null || option === true;

  if (exclude === false || (!isNotEmpty(exclude) && isDefault)) {
    return [];
  }

  return [{ path: ["exclude"], value: [...exclude] }];
}
