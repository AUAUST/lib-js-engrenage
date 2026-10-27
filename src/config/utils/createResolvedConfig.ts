import type { InferOutput } from "valibot";

import { wrap } from "@auaust/primitive-kit/arrays";
import { compose } from "@auaust/toolkit/composer";
import { isPlainObject } from "@auaust/toolkit/isPlainObject";
import { memoized } from "@auaust/toolkit/memoized";
import { freeze } from "@auaust/toolkit/object";
import { once } from "@auaust/toolkit/once";

import { globalsSchema } from "#config/config/schemas/defineSchema";
import {
  defaultBinDirectories,
  defaultCodeFiles,
  defaultConfigFiles,
  defaultCoverageDirectory,
  defaultDefineTypes,
  defaultDiscoveredFiles,
  defaultEmptyOutDir,
  defaultEnvFile,
  defaultFixtureFiles,
  defaultGeneratedFiles,
  defaultInstructionFiles,
  defaultPresets,
  defaultScriptDirectories,
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
import { validate } from "#utils/validate";
import type { configSchema } from "#config/config/schemas/configSchema";
import type { Environment } from "#config/types/Environment";
import type { ResolvedGlobals } from "#config/types/ResolvedGlobals";
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

  function locate(fallback: File, configured?: File): File | undefined {
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
    return locate(tsconfigFile, raw.typescript?.tsconfig);
  }

  function distTsconfigPath(): File | undefined {
    return (
      locate(distTsconfigFile, raw.typescript?.distTsconfig) ?? tsconfigPath()
    );
  }

  function envFilePath(): File {
    return resolveWithin(root, raw.typescript?.envFile ?? defaultEnvFile);
  }

  function gitignorePath(): File | undefined {
    return locate(gitignoreFile, raw.git?.gitignore);
  }

  function prettierignorePath(): File | undefined {
    return locate(prettierignoreFile, raw.prettier?.prettierignore);
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
    return wrap(raw.presets ?? defaultPresets);
  });

  function outDir(): Directory | undefined {
    const configured = raw.build?.outDir;

    if (configured !== undefined) {
      resolveWithin(root, configured);

      return configured;
    }

    const tsconfigOutDir = tsconfig().optional.outDir;

    return tsconfigOutDir === undefined || !isWithin(root, tsconfigOutDir)
      ? undefined
      : tsconfigOutDir;
  }

  function resolveGlobals(): ResolvedGlobals {
    const values = raw.define?.values;

    if (values === undefined) {
      return {};
    }

    if (isPlainObject(values)) {
      return values;
    }

    return validate(
      globalsSchema,
      values({
        packageJson: packageJson(),
        filesystem,
      }),
      `define.values of ${configFile ?? root}`,
    );
  }

  const define = once(() => {
    return freeze({
      types: raw.define?.types ?? defaultDefineTypes,
      values: freeze(resolveGlobals()),
    });
  });

  const code = once(() => {
    return freeze({
      files: wrap(raw.code?.files ?? defaultCodeFiles),
      configFiles: wrap(raw.code?.configFiles ?? defaultConfigFiles),
      discoveredFiles: wrap(
        raw.code?.discoveredFiles ?? defaultDiscoveredFiles,
      ),
      generatedFiles: wrap(raw.code?.generatedFiles ?? defaultGeneratedFiles),
    });
  });

  const source = once(() => {
    return freeze({
      dirs: wrap(raw.source?.dirs ?? defaultSourceDirectories),
    });
  });

  const bin = once(() => {
    return freeze({
      dirs: wrap(raw.bin?.dirs ?? defaultBinDirectories),
    });
  });

  const scripts = once(() => {
    return freeze({
      dirs: wrap(raw.scripts?.dirs ?? defaultScriptDirectories),
    });
  });

  const test = once(() => {
    const dirs = wrap(raw.test?.dirs ?? defaultTestDirectories);

    return freeze({
      dirs,
      files: wrap(raw.test?.files ?? defaultTestFiles),
      fixtureFiles: filesIn(
        dirs,
        raw.test?.fixtureFiles ?? defaultFixtureFiles,
      ),
      coverageDir: raw.test?.coverageDir ?? defaultCoverageDirectory,
    });
  });

  const build = once(() => {
    return freeze(
      compose(
        {
          emptyOutDir: raw.build?.emptyOutDir ?? defaultEmptyOutDir,
        },
        compose.getters({
          outDir,
        }),
      ),
    );
  });

  const typescript = once(() => {
    return freeze(
      compose(
        {},
        compose.getters({
          tsconfig: tsconfigPath,
          distTsconfig: distTsconfigPath,
          envFile: envFilePath,
        }),
      ),
    );
  });

  const git = once(() => {
    return freeze(
      compose(
        {},
        compose.getters({
          gitignore: gitignorePath,
        }),
      ),
    );
  });

  const prettier = once(() => {
    return freeze(
      compose(
        {},
        compose.getters({
          prettierignore: prettierignorePath,
        }),
      ),
    );
  });

  const agents = once(() => {
    return freeze({
      instructionFiles: wrap(
        raw.agents?.instructionFiles ?? defaultInstructionFiles,
      ),
      snippetsDir: raw.agents?.snippetsDir,
      claudeSettings: raw.agents?.claudeSettings,
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
        packageJson,
        tsconfig,
        environment,
        presets,
        define,
        code,
        source,
        bin,
        scripts,
        test,
        build,
        typescript,
        git,
        prettier,
        agents,
        github,
        vscode,
      }),
    ),
  );
}
