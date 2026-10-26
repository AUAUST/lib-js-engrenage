import { keys } from "@auaust/toolkit/object";
import type { Maybe } from "@auaust/toolkit/types";

import { arethetypeswrongCore, packageJsonFile, publint } from "#constants";
import { readJsonFile } from "#support/filesystem/utils/readJsonFile";
import { optionsSchema } from "#tsdown/config/schemas/optionsSchema";
import { attwOptions, mainFields } from "#tsdown/constants";
import { createTsdownEntries } from "#tsdown/utils/createTsdownEntries";
import { resolvePathAliases } from "#typescript/utils/resolvePathAliases";
import { validate } from "#utils/validate";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { Config } from "#tsdown/types/Config";
import type { Options } from "#tsdown/types/Options";
import type { File } from "#types/File";

function readPackageSnapshot(path: File): string {
  return JSON.stringify(readJsonFile(path));
}

function assertPackageUnchanged(path: File, snapshot: string) {
  if (readPackageSnapshot(path) !== snapshot) {
    throw new Error(
      `${path} changed during the build: build locally and commit the regenerated file`,
    );
  }
}

export function createTsdownConfig(
  config: ResolvedConfig,
  { ci }: { ci: boolean },
  options?: Maybe<Options>,
): Config {
  const { bins, customExports, bundle } = validate(
    optionsSchema,
    options ?? {},
    "tsdown options",
  );

  const { environment, packageJson, packageJsonPath, tsconfig } = config;

  if (packageJsonPath === undefined) {
    throw new Error(`No ${packageJsonFile} found in ${config.root}`);
  }

  if (packageJson.optional.type !== "module") {
    throw new Error(
      `${packageJsonPath} must declare "type": "module": libraries ship ESM only`,
    );
  }

  const pathAliases = resolvePathAliases(
    packageJson.name,
    tsconfig.paths,
    config.root,
  );

  const packageSnapshot = readPackageSnapshot(packageJsonPath);

  return {
    cwd: config.root,
    entry: createTsdownEntries(pathAliases, bins),
    format: "esm",
    outDir: tsconfig.outDir,
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
      customExports,
    },
    sourcemap: true,
    report: false,
    publint: environment.hasDependency(publint),
    attw: {
      enabled: environment.hasDependency(arethetypeswrongCore),
      ...attwOptions,
    },
    deps: {
      onlyBundle: [...bundle],
    },
    inputOptions: {
      resolve: {
        mainFields: [...mainFields],
      },
    },
    failOnWarn: ci,
    minify: ci,
    hooks: {
      "build:done"() {
        if (ci) {
          assertPackageUnchanged(packageJsonPath, packageSnapshot);
        }
      },
    },
  };
}
