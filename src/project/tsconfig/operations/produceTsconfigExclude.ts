import { isNotEmpty } from "@auaust/primitive-kit/arrays";

import { resolveListOption } from "#foundation/options/index";
import { resolveTsconfigEnvironments } from "#project/tsconfig/operations/resolveTsconfigEnvironments";
import { toTsconfigGlobs } from "#project/tsconfig/utils/toTsconfigGlobs";
import type { JsonEdit } from "#foundation/json/index";
import type { ConfigContext } from "#project/config/index";
import type { TsconfigKey } from "#project/tsconfig/types/TsconfigKey";
import type { TsconfigTarget } from "#project/tsconfig/types/TsconfigTarget";
import type { File } from "#types/File";

async function createDefaultExclude(
  config: ConfigContext,
  key: TsconfigKey,
  file: File,
): Promise<() => readonly string[]> {
  const { environments } = await resolveTsconfigEnvironments(config, key);

  const includesTests = environments.includes("tests");

  const { fixtures } = await config.get("files");

  return () => {
    return includesTests ? toTsconfigGlobs(file, fixtures) : [];
  };
}

export async function produceTsconfigExclude(
  config: ConfigContext,
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
