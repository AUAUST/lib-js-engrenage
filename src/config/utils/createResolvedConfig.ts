import { basename } from "node:path";

import type { InferOutput } from "valibot";

import { flatMap, wrap } from "@auaust/primitive-kit/arrays";
import { compose } from "@auaust/toolkit/composer";
import { isPlainObject } from "@auaust/toolkit/isPlainObject";
import { memoized } from "@auaust/toolkit/memoized";
import { freeze } from "@auaust/toolkit/object";
import { once } from "@auaust/toolkit/once";

import { globalsSchema } from "#config/config/schemas/defineSchema";
import {
  defaultBinDirectories,
  defaultCacheDirectory,
  defaultDefines,
  defaultDefineTypes,
  defaultEmptyOutDir,
  defaultEnvFile,
  defaultInstructionFiles,
  defaultPresets,
  defaultScriptsDirectories,
  defaultSourceDirectories,
  defaultSourcemap,
  defaultTestsCoverageDirectory,
  defaultTestsDirectories,
  defaultTestsFiles,
  defaultTestsFixtures,
  defaultToolingDirectories,
  defaultToolingFiles,
  defaultTypescriptFiles,
} from "#config/constants";
import { createFilesystem } from "#config/utils/createFilesystem";
import { resolveCodeEnvironment } from "#config/utils/resolveCodeEnvironment";
import { resolveListOption } from "#config/utils/resolveListOption";
import { resolveTsconfig } from "#config/utils/resolveTsconfig";
import {
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
import type { EnvironmentTsconfig } from "#config/types/EnvironmentTsconfig";
import type { ResolvedGlobals } from "#config/types/ResolvedGlobals";
import type { TsconfigGroups } from "#config/types/TsconfigGroups";
import type { TsconfigKey } from "#config/types/TsconfigKey";
import type { PackageJson } from "#support/packageJson/types/PackageJson";
import type { Directories } from "#types/Directories";
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

  const baseTsconfigFile = once(() => {
    const file = raw.typescript?.tsconfig?.path ?? tsconfigFile;

    if (basename(file) !== tsconfigFile) {
      console.warn(
        `The base tsconfig ${file} is not named ${tsconfigFile}, the only name editors and typed lint discover`,
      );
    }

    return file;
  });

  function tsconfigPath(): File | undefined {
    return locate(baseTsconfigFile(), raw.typescript?.tsconfig?.path);
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

  const typescriptFiles = once(() => {
    return resolveListOption(
      raw.typescript?.files,
      () => defaultTypescriptFiles,
      "typescript.files",
    );
  });

  function resolveEnvironment(
    name: "src" | "bin" | "scripts" | "tests",
    dirs: Directories,
  ) {
    return freeze({
      ...resolveCodeEnvironment({
        name,
        option: raw[name],
        dirs,
        defines: defaultDefines[name],
        typescriptFiles: typescriptFiles(),
        filesystem,
      }),
      tsconfig: environmentTsconfigFor(name),
    });
  }

  function environmentTsconfig(
    option:
      | false
      | { tsconfig?: EnvironmentTsconfig | false | undefined }
      | undefined,
  ) {
    return option === false ? false : option?.tsconfig;
  }

  const tsconfigGroups = once((): TsconfigGroups => {
    return {
      "src": environmentTsconfig(raw.src),
      "tests": environmentTsconfig(raw.tests),
      "tests.dist": raw.tests === false ? false : raw.tests?.dist?.tsconfig,
      "bin": environmentTsconfig(raw.bin),
      "scripts": environmentTsconfig(raw.scripts),
      "tooling": environmentTsconfig(raw.tooling),
    };
  });

  function environmentTsconfigFor(key: TsconfigKey) {
    const resolved = resolveTsconfig(key, tsconfigGroups());

    function path(): File | undefined {
      if (resolved.file === undefined || resolved.owner === undefined) {
        return undefined;
      }

      const configured = tsconfigGroups()[resolved.owner];

      const located = locate(
        resolved.file,
        configured === false ? undefined : configured?.path,
      );

      return key === "tests.dist" ? (located ?? tsconfigPath()) : located;
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

  const source = once(() => {
    return freeze({
      ...resolveEnvironment("src", defaultSourceDirectories),
      exports: raw.src === false ? undefined : raw.src?.exports,
    });
  });

  const bin = once(() => {
    return freeze({
      ...resolveEnvironment("bin", defaultBinDirectories),
      commands: raw.bin === false ? undefined : raw.bin?.commands,
    });
  });

  const data = once(() => {
    return freeze({
      active: raw.data !== false,
      exports: (raw.data === false ? undefined : raw.data?.exports) ?? {},
    });
  });

  const scripts = once(() => {
    return resolveEnvironment("scripts", defaultScriptsDirectories);
  });

  const tests = once(() => {
    const option = raw.tests === false ? undefined : raw.tests;
    const enabled = raw.tests !== false;

    return freeze({
      ...resolveEnvironment("tests", defaultTestsDirectories),
      files: enabled
        ? resolveListOption(
            option?.files,
            () => defaultTestsFiles,
            "tests.files",
          )
        : [],
      fixtures: enabled
        ? resolveListOption(
            option?.fixtures,
            () => defaultTestsFixtures,
            "tests.fixtures",
          )
        : [],
      coverageDir: option?.coverageDir ?? defaultTestsCoverageDirectory,
      dist: freeze({
        tsconfig: environmentTsconfigFor("tests.dist"),
      }),
    });
  });

  const tooling = once(() => {
    if (raw.tooling === false) {
      return freeze({
        active: false,
        dirs: [],
        files: [],
        globs: [],
        tsconfig: environmentTsconfigFor("tooling"),
      });
    }

    const dirs = resolveListOption(
      raw.tooling?.dirs,
      () => defaultToolingDirectories,
      "tooling.dirs",
    );

    const files = resolveListOption(
      raw.tooling?.files,
      () => defaultToolingFiles,
      "tooling.files",
    );

    return freeze({
      active: dirs.some((directory) => filesystem.isDirectory(directory)),
      dirs,
      files,
      globs: filesIn(dirs, files),
      tsconfig: environmentTsconfigFor("tooling"),
    });
  });

  const files = once(() => {
    const environments = [source(), tests(), bin(), scripts()];

    return freeze({
      generated: flatMap(environments, ({ dirs, generated }) => {
        return filesIn(dirs, generated);
      }),
      discovered: flatMap(environments, ({ dirs, discovered }) => {
        return filesIn(dirs, discovered);
      }),
      fixtures: filesIn(tests().dirs, tests().fixtures),
      published: [...source().globs, ...bin().globs],
      private: [...tests().globs, ...scripts().globs],
    });
  });

  const build = once(() => {
    const typed = () => {
      return raw.build?.typed ?? define().types;
    };

    return freeze(
      compose(
        {
          emptyOutDir: raw.build?.emptyOutDir ?? defaultEmptyOutDir,
          sourcemap: raw.build?.sourcemap ?? defaultSourcemap,
        },
        compose.getters({
          typed,
          outDir,
        }),
      ),
    );
  });

  const cache = once(() => {
    const dir = raw.cache?.dir ?? defaultCacheDirectory;

    resolveWithin(root, dir);

    return freeze({
      dir,
    });
  });

  const baseTsconfig = once(() => {
    const option = raw.typescript?.tsconfig;

    return freeze(
      compose(
        {
          file: baseTsconfigFile(),
          extends: option?.extends,
          compilerOptions: option?.compilerOptions ?? {},
          unmanaged: resolveListOption(
            option?.unmanaged,
            () => [],
            "typescript.tsconfig.unmanaged",
          ),
        },
        compose.getters({
          path: tsconfigPath,
        }),
      ),
    );
  });

  const typescript = once(() => {
    return freeze(
      compose(
        {},
        compose.getters({
          tsconfig: baseTsconfig,
          envFile: envFilePath,
          files: typescriptFiles,
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
      preferred: raw.agents?.preferred,
      codexHooks: raw.agents?.codexHooks,
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

  function cacheFor(packageName: PackageName): Directory {
    return resolveWithin(root, cache().dir, packageName);
  }

  return freeze(
    compose(
      {
        root,
        raw,
        configFile,
        filesystem,
        resolve,
        cacheFor,
      },
      compose.getters({
        packageJsonPath,
        packageJson,
        tsconfig,
        environment,
        presets,
        define,
        src: source,
        tests,
        bin,
        scripts,
        data,
        tooling,
        files,
        build,
        cache,
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
