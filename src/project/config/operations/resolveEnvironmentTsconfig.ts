import { compose } from "@auaust/toolkit/composer";
import { freeze } from "@auaust/toolkit/object";

import { binOptionsSection } from "#project/config/operations/binOptionsSection";
import { scriptsOptionsSection } from "#project/config/operations/scriptsOptionsSection";
import { sourceOptionsSection } from "#project/config/operations/sourceOptionsSection";
import { testsOptionsSection } from "#project/config/operations/testsOptionsSection";
import { toolingOptionsSection } from "#project/config/operations/toolingOptionsSection";
import { locateFile } from "#project/config/utils/locateFile";
import {
  resolveTsconfig,
  type ResolvedEnvironmentTsconfig,
  type TsconfigKey,
} from "#project/tsconfig/index";
import type { Resolver } from "#foundation/options/index";
import type { ConfigContext } from "#project/config/types/ConfigContext";
import type { File } from "#types/File";

export async function resolveEnvironmentTsconfig(
  config: Resolver<ConfigContext>,
  key: TsconfigKey,
): Promise<ResolvedEnvironmentTsconfig> {
  const [source, tests, bin, scripts, tooling] = await Promise.all([
    config.resolve(sourceOptionsSection),
    config.resolve(testsOptionsSection),
    config.resolve(binOptionsSection),
    config.resolve(scriptsOptionsSection),
    config.resolve(toolingOptionsSection),
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
