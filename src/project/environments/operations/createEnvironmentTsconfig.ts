import { compose } from "@auaust/toolkit/composer";
import { freeze } from "@auaust/toolkit/object";

import { locateFile, type ConfigResolver } from "#project/config/index";
import {
  resolveTsconfig,
  type ResolvedEnvironmentTsconfig,
  type ResolvedEnvironmentTsconfigOption,
  type TsconfigKey,
} from "#project/tsconfig/index";
import type { File } from "#types/File";

/**
 * The tsconfig of `key` from its resolved option, its `path` located on first
 * read; `file` is `undefined` when sync manages none.
 */
export function createEnvironmentTsconfig(
  config: ConfigResolver,
  key: TsconfigKey,
  option: ResolvedEnvironmentTsconfigOption,
): ResolvedEnvironmentTsconfig {
  const { location, ...resolved } = resolveTsconfig(key, option);

  function path(): Promise<File | undefined> {
    return location === undefined
      ? Promise.resolve(undefined)
      : locateFile(config.context, location.file, location.configured);
  }

  return freeze(compose({ ...resolved }, compose.getters({ path })));
}
