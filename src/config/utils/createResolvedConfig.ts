import type { InferOutput } from "valibot";

import { compose } from "@auaust/toolkit/composer";
import { freeze } from "@auaust/toolkit/object";
import { once } from "@auaust/toolkit/once";

import {
  builtinGeneratedFiles,
  defaultCodeFiles,
  defaultConfigFiles,
  defaultDiscoveredFiles,
  defaultFixtureFiles,
  defaultInstructionFiles,
  defaultPresets,
  defaultSourceDirectories,
  defaultTestDirectories,
  defaultTestFiles,
} from "#config/constants";
import { isWithin } from "#support/filesystem/utils/isWithin";
import { resolveWithin } from "#support/filesystem/utils/resolveWithin";
import { createPackageJson } from "#support/packageJson/utils/createPackageJson";
import { createTsconfig } from "#typescript/utils/createTsconfig";
import type { configSchema } from "#config/config/schemas/configSchema";
import type { Environment } from "#config/types/Environment";
import type { PackageJson } from "#support/packageJson/types/PackageJson";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";
import type { PackageName } from "#types/PackageName";

function createEnvironment({ optional }: PackageJson): Environment {
  const packages = new Set<PackageName>(optional.dependencies);

  if (optional.name !== undefined) {
    packages.add(optional.name);
  }

  function has(name: PackageName): boolean {
    return packages.has(name);
  }

  return freeze({
    has,
  });
}

export function createResolvedConfig({
  root,
  raw,
  packageJsonPath,
  tsconfigPath,
  distTsconfigPath,
  gitignorePath,
}: {
  root: Directory;
  raw: InferOutput<typeof configSchema>;
  packageJsonPath: File | undefined;
  tsconfigPath: File | undefined;
  distTsconfigPath: File | undefined;
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

  const environment = once(() => {
    return createEnvironment(packageJson());
  });

  const presets = once(() => {
    return raw.presets ?? defaultPresets;
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
      ...(outDir === undefined || !isWithin(root, outDir)
        ? []
        : [`${outDir}/**`]),
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

  const vscode = once(() => {
    return freeze({
      settings: raw.vscode?.settings,
      extensions: raw.vscode?.extensions,
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
        distTsconfigPath,
        gitignorePath,
        resolve,
      },
      compose.getters({
        packageJson,
        tsconfig,
        environment,
        presets,
        directories,
        files,
        agents,
        vscode,
      }),
    ),
  );
}
