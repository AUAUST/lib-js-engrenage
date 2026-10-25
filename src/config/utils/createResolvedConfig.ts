import { compose } from "@auaust/toolkit/composer";
import { freeze } from "@auaust/toolkit/object";
import { once } from "@auaust/toolkit/once";
import type { InferOutput } from "valibot";

import {
  builtinGeneratedFiles,
  defaultCodeFiles,
  defaultConfigFiles,
  defaultDiscoveredFiles,
  defaultFixtureFiles,
  defaultInstructionFiles,
  defaultSourceDirectories,
  defaultTestDirectories,
  defaultTestFiles,
} from "#config/constants";
import { resolveWithin } from "#support/filesystem/utils/resolveWithin";
import { createPackageJson } from "#support/packageJson/utils/createPackageJson";
import { createTsconfig } from "#support/tsconfig/utils/createTsconfig";
import type { configSchema } from "#config/config/schemas/configSchema";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

export function createResolvedConfig({
  root,
  raw,
  packageJsonPath,
  tsconfigPath,
  gitignorePath,
}: {
  root: Directory;
  raw: InferOutput<typeof configSchema>;
  packageJsonPath: File | undefined;
  tsconfigPath: File | undefined;
  gitignorePath: File | undefined;
}) {
  const packageJson = once(() => {
    return createPackageJson({
      root,
      path: packageJsonPath,
    });
  });

  const tsconfig = once(() => {
    return createTsconfig({
      root,
      path: tsconfigPath,
    });
  });

  const directories = once(() => {
    return freeze({
      source: raw.directories?.source ?? defaultSourceDirectories,
      test: raw.directories?.test ?? defaultTestDirectories,
    });
  });

  const generatedFiles = once(() => {
    const { outDir } = tsconfig().optional;

    return freeze([
      ...builtinGeneratedFiles,
      ...(raw.files?.generated ?? []),
      ...(outDir === undefined ? [] : [`${outDir}/**`]),
    ]);
  });

  const files = once(() => {
    return freeze(
      compose(
        {
          code: raw.files?.code ?? defaultCodeFiles,
          test: raw.files?.test ?? defaultTestFiles,
          fixtures: raw.files?.fixtures ?? defaultFixtureFiles,
          config: raw.files?.config ?? defaultConfigFiles,
          discovered: raw.files?.discovered ?? defaultDiscoveredFiles,
        },
        compose.getters({
          generated: generatedFiles,
        }),
      ),
    );
  });

  const agents = once(() => {
    return freeze({
      instructionFiles: raw.agents?.instructionFiles ?? defaultInstructionFiles,
      snippetsDirectory: raw.agents?.snippetsDirectory,
    });
  });

  function resolve(...paths: string[]): string {
    return resolveWithin(root, ...paths);
  }

  return freeze(
    compose(
      {
        root,
        raw,
        packageJsonPath,
        tsconfigPath,
        gitignorePath,
        resolve,
      },
      compose.getters({
        packageJson,
        tsconfig,
        directories,
        files,
        agents,
      }),
    ),
  );
}
