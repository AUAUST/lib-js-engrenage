import { keys } from "@auaust/toolkit/object";
import type { Maybe } from "@auaust/toolkit/types";

import { validate } from "#support/validation/utils/validate";
import { createTsdownEntries } from "#tsdown/builders/createTsdownEntries";
import { optionsSchema } from "#tsdown/config/schemas/optionsSchema";
import { attwOptions } from "#tsdown/constants";
import { assertPackageUnchanged } from "#tsdown/utils/assertPackageUnchanged";
import { readPackageSnapshot } from "#tsdown/utils/readPackageSnapshot";
import { resolvePathAliases } from "#typescript/utils/resolvePathAliases";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { Config } from "#tsdown/types/Config";
import type { Options } from "#tsdown/types/Options";

export function createTsdownConfig(
  config: ResolvedConfig,
  { ci }: { ci: boolean },
  options?: Maybe<Options>,
): Config {
  const { bins, fileExports, bundle } = validate(
    optionsSchema,
    options ?? {},
    "tsdown options",
  );

  const { name } = config.package;

  const { outDir, paths } = config.tsconfig;

  if (name === null) {
    throw new Error(`${config.packagePath} must declare a name`);
  }

  if (outDir === undefined || paths === undefined) {
    throw new Error(`${config.tsconfigPath} must resolve outDir and paths`);
  }

  const pathAliases = resolvePathAliases(name, paths, config.root);

  const packageSnapshot = readPackageSnapshot(config.packagePath);

  return {
    cwd: config.root,
    entry: createTsdownEntries(pathAliases, bins),
    outDir,
    tsconfig: config.tsconfigPath,
    dts: {
      compilerOptions: {
        declaration: true,
      },
      sourcemap: true,
    },
    exports: {
      enabled: true,
      packageJson: false,
      exclude: keys(bins),
      customExports: fileExports,
    },
    sourcemap: true,
    report: false,
    publint: true,
    attw: {
      enabled: true,
      ...attwOptions,
    },
    deps: {
      onlyBundle: bundle,
    },
    failOnWarn: ci,
    minify: ci,
    hooks: {
      "build:done"() {
        if (ci) {
          assertPackageUnchanged(config.packagePath, packageSnapshot);
        }
      },
    },
  };
}
