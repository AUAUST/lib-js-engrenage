import type { InferOutput } from "valibot";

import { map } from "@auaust/primitive-kit/arrays";
import { compose } from "@auaust/toolkit/composer";
import { memoized } from "@auaust/toolkit/memoized";
import { freeze } from "@auaust/toolkit/object";
import { once } from "@auaust/toolkit/once";

import {
  defaultCodeFiles,
  defaultConfigFiles,
  defaultCoverageDirectory,
  defaultDiscoveredFiles,
  defaultEmptyOutDir,
  defaultFixtureFiles,
  defaultGeneratedFiles,
  defaultInstructionFiles,
  defaultPresets,
  defaultSourceDirectories,
  defaultTestDirectories,
  defaultTestFiles,
} from "#config/constants";
import { createFilesystem } from "#config/utils/createFilesystem";
import {
  distTsconfigFile,
  gitignoreFile,
  packageJsonFile,
  prettierignoreFile,
  tsconfigFile,
} from "#constants";
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
import type { Tsconfig } from "#typescript/types/Tsconfig";

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
}: {
  root: Directory;
  raw: InferOutput<typeof configSchema>;
  configFile: File | undefined;
}) {
  const filesystem = createFilesystem(root);

  function locate(
    fallback: File,
    configured: File | undefined = undefined,
  ): File | undefined {
    if (configured === undefined) {
      return filesystem.exists(fallback)
        ? resolveWithin(root, fallback)
        : undefined;
    }

    if (!filesystem.exists(configured)) {
      throw new Error(`The configured ${configured} does not exist in ${root}`);
    }

    return resolveWithin(root, configured);
  }

  function packageJsonPath(): File | undefined {
    return locate(packageJsonFile);
  }

  function tsconfigPath(): File | undefined {
    return locate(tsconfigFile, raw.files?.tsconfig);
  }

  function distTsconfigPath(): File | undefined {
    return locate(distTsconfigFile, raw.files?.distTsconfig) ?? tsconfigPath();
  }

  function gitignorePath(): File | undefined {
    return locate(gitignoreFile, raw.files?.gitignore);
  }

  function prettierignorePath(): File | undefined {
    return locate(prettierignoreFile, raw.files?.prettierignore);
  }

  const parsePackageJson = memoized((content: string | undefined) => {
    return createPackageJson({
      root,
      path: packageJsonPath(),
      content,
    });
  });

  const describeEnvironment = memoized(createEnvironment);

  function packageJson(): PackageJson {
    const path = packageJsonPath();

    return parsePackageJson(
      path === undefined ? undefined : filesystem.read(path),
    );
  }

  function environment(): Environment {
    return describeEnvironment(packageJson());
  }

  const parseTsconfig = memoized((path: File | undefined) => {
    return createTsconfig({
      root,
      path,
      filesystem,
    });
  });

  function tsconfig(): Tsconfig {
    return parseTsconfig(tsconfigPath());
  }

  const presets = once(() => {
    return raw.presets ?? defaultPresets;
  });

  function outputDirectory(): Directory | undefined {
    const configured = raw.directories?.output;

    if (configured !== undefined) {
      resolveWithin(root, configured);

      return configured;
    }

    const { outDir } = tsconfig().optional;

    return outDir === undefined || !isWithin(root, outDir) ? undefined : outDir;
  }

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

  const build = once(() => {
    return freeze({
      emptyOutDir: raw.build?.emptyOutDir ?? defaultEmptyOutDir,
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
        filesystem,
        resolve,
      },
      compose.getters({
        packageJsonPath,
        tsconfigPath,
        distTsconfigPath,
        gitignorePath,
        prettierignorePath,
        packageJson,
        tsconfig,
        environment,
        presets,
        directories,
        files,
        build,
        agents,
        github,
        vscode,
      }),
    ),
  );
}
