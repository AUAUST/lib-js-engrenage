import type { InferOutput } from "valibot";

import { map } from "@auaust/primitive-kit/arrays";
import { compose } from "@auaust/toolkit/composer";
import { freeze } from "@auaust/toolkit/object";
import { once } from "@auaust/toolkit/once";

import {
  defaultCodeFiles,
  defaultConfigFiles,
  defaultCoverageDirectory,
  defaultDiscoveredFiles,
  defaultFixtureFiles,
  defaultGeneratedFiles,
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
import { filesIn } from "#utils/filesIn";
import type { configSchema } from "#config/config/schemas/configSchema";
import type { Environment } from "#config/types/Environment";
import type { PackageJson } from "#support/packageJson/types/PackageJson";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";
import type { KnownPackageName } from "#types/KnownPackageName";
import type { PackageName } from "#types/PackageName";

function createEnvironment({ optional }: PackageJson): Environment {
  const packages = new Set<PackageName>(optional.dependencies);

  if (optional.name !== undefined) {
    packages.add(optional.name);
  }

  function hasDependency(name: PackageName): name is KnownPackageName {
    return packages.has(name);
  }

  return freeze({
    hasDependency,
  });
}

export function createResolvedConfig({
  root,
  raw,
  configFile,
  packageJsonPath,
  tsconfigPath,
  distTsconfigPath,
  gitignorePath,
  prettierignorePath,
}: {
  root: Directory;
  raw: InferOutput<typeof configSchema>;
  configFile: File | undefined;
  packageJsonPath: File | undefined;
  tsconfigPath: File | undefined;
  distTsconfigPath: File | undefined;
  gitignorePath: File | undefined;
  prettierignorePath: File | undefined;
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

  const outputDirectory = once(() => {
    const { outDir } = tsconfig().optional;

    return outDir === undefined || !isWithin(root, outDir) ? undefined : outDir;
  });

  const directories = once(() => {
    return freeze(
      compose(
        {
          source: raw.directories?.source ?? defaultSourceDirectories,
          test: raw.directories?.test ?? defaultTestDirectories,
          coverage: raw.directories?.coverage ?? defaultCoverageDirectory,
        },
        compose.getters({
          output: outputDirectory,
        }),
      ),
    );
  });

  const files = once(() => {
    const fixtures = raw.files?.fixtures ?? defaultFixtureFiles;

    return freeze({
      code: raw.files?.code ?? defaultCodeFiles,
      test: raw.files?.test ?? defaultTestFiles,
      fixtures: map(directories().test, (directory) => {
        return filesIn(directory, fixtures);
      }),
      config: raw.files?.config ?? defaultConfigFiles,
      discovered: raw.files?.discovered ?? defaultDiscoveredFiles,
      generated: raw.files?.generated ?? defaultGeneratedFiles,
    });
  });

  const agents = once(() => {
    return freeze({
      instructionFiles: raw.agents?.instructionFiles ?? defaultInstructionFiles,
      snippetsDirectory: raw.agents?.snippetsDirectory,
    });
  });

  const github = once(() => {
    return freeze({
      workflows: raw.github?.workflows,
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
        configFile,
        packageJsonPath,
        tsconfigPath,
        distTsconfigPath,
        gitignorePath,
        prettierignorePath,
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
        github,
        vscode,
      }),
    ),
  );
}
