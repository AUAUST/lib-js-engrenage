import { compose } from "@auaust/toolkit/composer";
import { freeze } from "@auaust/toolkit/object";

import { locateFile, type ConfigResolver } from "#project/config/index";
import {
  resolveTsconfig,
  type ResolvedEnvironmentTsconfig,
  type TsconfigKey,
} from "#project/tsconfig/index";
import type { File } from "#types/File";

export async function resolveEnvironmentTsconfig(
  config: ConfigResolver,
  key: TsconfigKey,
): Promise<ResolvedEnvironmentTsconfig> {
  const [source, tests, bin, scripts, tooling] = await Promise.all([
    config.resolve("src.options"),
    config.resolve("tests.options"),
    config.resolve("bin.options"),
    config.resolve("scripts.options"),
    config.resolve("tooling.options"),
  ]);

  const { location, ...resolved } = resolveTsconfig(key, {
    "src": source.tsconfig,
    "tests": tests.tsconfig,
    "tests.dist": tests.dist.tsconfig,
    "bin": bin.tsconfig,
    "scripts": scripts.tsconfig,
    "tooling": tooling.tsconfig,
  });

  function path(): Promise<File | undefined> {
    return location === undefined
      ? Promise.resolve(undefined)
      : locateFile(config.context, location.file, location.configured);
  }

  return freeze(
    compose(
      { ...resolved },
      compose.getters({
        path,
      }),
    ),
  );
}
