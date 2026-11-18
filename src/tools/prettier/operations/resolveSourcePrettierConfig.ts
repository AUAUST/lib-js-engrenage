import { createRequire } from "node:module";

import { isString } from "@auaust/toolkit";

import { packageJsonFile } from "#constants";
import { resolve } from "#foundation/filesystem/index";
import { hasNodeCondition } from "#foundation/processes/index";
import { sourceCondition } from "#project/package/constants";
import type { LoadedConfig } from "#project/config/index";
import type { File } from "#types/File";

/**
 * The config file the `package.json` `prettier` specifier names, resolved from
 * the project under the `source` condition while it is active, since Prettier's
 * own resolver ignores it; `undefined` otherwise, leaving Prettier to search.
 */
export async function resolveSourcePrettierConfig(
  config: LoadedConfig,
): Promise<File | undefined> {
  if (!hasNodeCondition(sourceCondition)) {
    return;
  }

  const { optional } = await config.resolve("packageJson");

  const specifier = optional.manifest?.prettier;

  return isString(specifier)
    ? createRequire(resolve(config.context.root, packageJsonFile)).resolve(
        specifier,
      )
    : undefined;
}
