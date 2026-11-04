import { flatMap, includes } from "@auaust/primitive-kit/arrays";
import { compose } from "@auaust/toolkit/composer";
import { memoized } from "@auaust/toolkit/memoized";
import { freeze } from "@auaust/toolkit/object";
import { once } from "@auaust/toolkit/once";

import { buildSchema } from "#config/config/schemas/core/buildSchema";
import { cacheSchema } from "#config/config/schemas/core/cacheSchema";
import { debugSchema } from "#config/config/schemas/core/debugSchema";
import { defineSchema } from "#config/config/schemas/core/defineSchema";
import { presetsSchema } from "#config/config/schemas/core/presetsSchema";
import { binSchema } from "#config/config/schemas/environments/binSchema";
import { dataSchema } from "#config/config/schemas/environments/dataSchema";
import { runtimeSchema } from "#config/config/schemas/environments/runtimeSchema";
import { scriptsSchema } from "#config/config/schemas/environments/scriptsSchema";
import { sourceSchema } from "#config/config/schemas/environments/sourceSchema";
import { testsSchema } from "#config/config/schemas/environments/testsSchema";
import { toolingSchema } from "#config/config/schemas/environments/toolingSchema";
import { agentsSchema } from "#config/config/schemas/tools/agentsSchema";
import { githubSchema } from "#config/config/schemas/tools/githubSchema";
import { gitSchema } from "#config/config/schemas/tools/gitSchema";
import { prettierSchema } from "#config/config/schemas/tools/prettierSchema";
import { typescriptSchema } from "#config/config/schemas/tools/typescriptSchema";
import { vscodeSchema } from "#config/config/schemas/tools/vscodeSchema";
import { distTestsVariant, sourceTestsVariant } from "#config/constants";
import { createFilesystem } from "#config/utils/createFilesystem";
import { isDebugEnvironment } from "#config/utils/isDebugEnvironment";
import { resolveCodeEnvironment } from "#config/utils/resolveCodeEnvironment";
import { resolveNodeRuntime } from "#config/utils/resolveNodeRuntime";
import { resolveSourceRuntime } from "#config/utils/resolveSourceRuntime";
import { resolveTsconfig } from "#config/utils/resolveTsconfig";
import { packageJsonFile } from "#constants";
import { rolesSchema } from "#project/structure/config/schemas/rolesSchema";
import { noRoles } from "#project/structure/constants";
import { resolveEnvironmentStructure } from "#project/structure/utils/resolveEnvironmentStructure";
import { resolveImportRules } from "#project/structure/utils/resolveImportRules";
import { resolveRoles } from "#project/structure/utils/resolveRoles";
import { resolveWithin } from "#support/filesystem/utils/resolveWithin";
import { createPackageJson } from "#support/packageJson/utils/createPackageJson";
import { createTsconfig } from "#typescript/utils/createTsconfig";
import { filesIn } from "#utils/filesIn";
import type { Config } from "#config/types/Config";
import type { ConfigContext } from "#config/types/ConfigContext";
import type { Environment } from "#config/types/Environment";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { ResolvedEnvironmentTsconfig } from "#config/types/ResolvedEnvironmentTsconfig";
import type { TsconfigGroups } from "#config/types/TsconfigGroups";
import type { TsconfigKey } from "#config/types/TsconfigKey";
import type { EnvironmentStructure } from "#project/structure/types/EnvironmentStructure";
import type { ResolvedRoles } from "#project/structure/types/ResolvedRoles";
import type { RoleEnvironment } from "#project/structure/types/RoleEnvironment";
import type { RolesOption } from "#project/structure/types/RolesOption";
import type { StructureEnvironment } from "#project/structure/types/StructureEnvironment";
import type { StructureOptions } from "#project/structure/types/StructureOptions";
import type { PackageJson } from "#support/packageJson/types/PackageJson";
import type { Directories } from "#types/Directories";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";
import type { Globs } from "#types/Globs";
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

type StructureSection =
  | { readonly enabled: false }
  | ({
      readonly enabled: true;
      readonly roles?: RolesOption;
    } & StructureOptions);

export function createResolvedConfig({
  root,
  raw,
  configFile,
}: {
  root: Directory;
  raw: Config;
  configFile: File | undefined;
}): ResolvedConfig {
  const filesystem = createFilesystem(root);

  const context: ConfigContext = {
    get(section) {
      return config[section];
    },
  };

  function locate(file: File, configured: boolean): File | undefined {
    if (!configured) {
      return filesystem.exists(file) ? resolveWithin(root, file) : undefined;
    }

    if (!filesystem.exists(file)) {
      throw new Error(`The configured ${file} does not exist in ${root}`);
    }

    return resolveWithin(root, file);
  }

  const debugOption = once(() => {
    return debugSchema.resolve(raw.debug, context, "debug");
  });

  const presets = once(() => {
    return presetsSchema.resolve(raw.presets, context, "presets");
  });

  const roles = once(() => {
    return rolesSchema.resolve(raw.roles, context, "roles");
  });

  const define = once(() => {
    return defineSchema.resolve(raw.define, context, "define");
  });

  const cacheOption = once(() => {
    return cacheSchema.resolve(raw.cache, context, "cache");
  });

  const runtimeOption = once(() => {
    return runtimeSchema.resolve(raw.runtime, context, "runtime");
  });

  const typescriptOption = once(() => {
    return typescriptSchema.resolve(raw.typescript, context, "typescript");
  });

  const sourceOption = once(() => {
    return sourceSchema.resolve(raw.src, context, "src");
  });

  const testsOption = once(() => {
    return testsSchema.resolve(raw.tests, context, "tests");
  });

  const binOption = once(() => {
    return binSchema.resolve(raw.bin, context, "bin");
  });

  const scriptsOption = once(() => {
    return scriptsSchema.resolve(raw.scripts, context, "scripts");
  });

  const toolingOption = once(() => {
    return toolingSchema.resolve(raw.tooling, context, "tooling");
  });

  const dataOption = once(() => {
    return dataSchema.resolve(raw.data, context, "data");
  });

  function packageJsonPath(): File | undefined {
    return locate(packageJsonFile, false);
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

  function tsconfigPath(): File | undefined {
    const { file, configured } = typescriptOption().tsconfig.path;

    return locate(file, configured);
  }

  // @debt the memo key holds the content of the base tsconfig only, so staged changes to a local tsconfig it extends are not seen within a pass
  const parseTsconfig = memoized(
    (path: File | undefined, content: string | undefined) => {
      return createTsconfig({
        root,
        path,
        filesystem,
        content,
      });
    },
    (path, content) => `${path}\0${content}`,
  );

  function tsconfig(): Tsconfig {
    const path = tsconfigPath();

    return parseTsconfig(
      path,
      path === undefined ? undefined : filesystem.read(path),
    );
  }

  const runtime = once(() => {
    return freeze({ node: runtimeOption().node });
  });

  function developmentRuntime() {
    return resolveNodeRuntime(runtime().node, "runtime.node");
  }

  function resolveEnvironmentRoles(
    name: RoleEnvironment,
    option: { readonly enabled: boolean; readonly roles?: RolesOption },
  ): ResolvedRoles {
    return option.enabled && option.roles !== undefined
      ? resolveRoles({
          environment: name,
          roles: roles(),
          environmentRoles: option.roles,
        })
      : noRoles;
  }

  function resolveStructure(
    name: StructureEnvironment,
    environment: { active: boolean; dirs: Directories },
    option: StructureSection,
  ): EnvironmentStructure | undefined {
    if (!option.enabled || !environment.active) {
      return;
    }

    return resolveEnvironmentStructure({
      name,
      root,
      dirs: environment.dirs,
      options: option,
      roles: roles(),
      environmentRoles: option.roles,
    });
  }

  const tsconfigGroups = once((): TsconfigGroups => {
    return {
      "src": sourceOption().tsconfig,
      "tests": testsOption().tsconfig,
      "tests.dist": testsOption().dist.tsconfig,
      "bin": binOption().tsconfig,
      "scripts": scriptsOption().tsconfig,
      "tooling": toolingOption().tsconfig,
    };
  });

  function environmentTsconfigFor(
    key: TsconfigKey,
  ): ResolvedEnvironmentTsconfig {
    const { location, ...resolved } = resolveTsconfig(key, tsconfigGroups());

    function path(): File | undefined {
      return location === undefined
        ? undefined
        : locate(location.file, location.configured);
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

  const typescriptFiles = once((): Globs => typescriptOption().files);

  function resolveEnvironment(
    option: {
      dirs: Directories;
      generated: Globs;
      discovered: Globs;
      defines: boolean;
    },
    key: TsconfigKey,
  ) {
    return freeze({
      ...resolveCodeEnvironment({
        ...option,
        typescriptFiles: typescriptFiles(),
        filesystem,
      }),
      tsconfig: environmentTsconfigFor(key),
    });
  }

  const source = once(() => {
    const option = sourceOption();
    const environment = resolveEnvironment(option, "src");

    const runtime = once(() => {
      return option.enabled &&
        (environment.active ||
          option.baseline !== undefined ||
          option.node !== undefined)
        ? resolveSourceRuntime(option)
        : undefined;
    });

    return freeze(
      compose(
        {
          ...environment,
          roles: resolveEnvironmentRoles("src", option),
          exports: option.exports,
          apis: option.apis,
        },
        compose.getters({
          runtime,
        }),
      ),
    );
  });

  const bin = once(() => {
    const option = binOption();

    return freeze(
      compose(
        {
          roles: noRoles,
          commands: option.commands,
        },
        compose.values(resolveEnvironment(option, "bin")),
        compose.getters({
          runtime: () => {
            return option.enabled
              ? freeze({ kind: "node" as const, major: option.node })
              : undefined;
          },
        }),
      ),
    );
  });

  const data = once(() => {
    const option = dataOption();

    return freeze({
      active: option.enabled,
      roles: noRoles,
      dirs: option.dirs,
      exports: option.exports,
    });
  });

  const scripts = once(() => {
    const option = scriptsOption();

    return freeze(
      compose(
        {
          roles: resolveEnvironmentRoles("scripts", option),
        },
        compose.values(resolveEnvironment(option, "scripts")),
        compose.getters({
          runtime: developmentRuntime,
        }),
      ),
    );
  });

  const tests = once(() => {
    const option = testsOption();

    function pattern(variant: string): Globs {
      return option.enabled
        ? [`${option.location}${option.suffix}${variant}${option.extension}`]
        : [];
    }

    const patterns = freeze({
      plain: pattern(""),
      source: pattern(sourceTestsVariant),
      dist: pattern(distTestsVariant),
    });

    return freeze(
      compose(
        {
          roles: resolveEnvironmentRoles("tests", option),
          patterns,
          files: [...patterns.plain, ...patterns.source, ...patterns.dist],
          fixtures: option.fixtures,
          coverageDir: option.coverageDir,
          dist: freeze({
            tsconfig: environmentTsconfigFor("tests.dist"),
          }),
        },
        compose.values(resolveEnvironment(option, "tests")),
        compose.getters({
          runtime: developmentRuntime,
        }),
      ),
    );
  });

  const tooling = once(() => {
    const option = toolingOption();
    const { dirs, files } = option;

    return freeze(
      compose(
        {
          active: dirs.some((directory) => filesystem.isDirectory(directory)),
          dirs,
          files,
          defines: false,
          globs: filesIn(dirs, files),
          roles: resolveEnvironmentRoles("tooling", option),
          tsconfig: environmentTsconfigFor("tooling"),
        },
        compose.getters({
          runtime: developmentRuntime,
        }),
      ),
    );
  });

  const structure = once(() => {
    return freeze({
      src: resolveStructure("src", source(), sourceOption()),
      tests: resolveStructure("tests", tests(), testsOption()),
      bin: resolveStructure("bin", bin(), binOption()),
      scripts: resolveStructure("scripts", scripts(), scriptsOption()),
      tooling: resolveStructure("tooling", tooling(), toolingOption()),
    });
  });

  const importRules = once(() => {
    const trees = structure();

    return resolveImportRules({
      structures: {
        ...(trees.src === undefined ? {} : { src: trees.src }),
        ...(trees.tests === undefined ? {} : { tests: trees.tests }),
        ...(trees.bin === undefined ? {} : { bin: trees.bin }),
        ...(trees.scripts === undefined ? {} : { scripts: trees.scripts }),
        ...(trees.tooling === undefined ? {} : { tooling: trees.tooling }),
      },
      roles: {
        src: source().roles,
        tests: tests().roles,
        scripts: scripts().roles,
        tooling: tooling().roles,
      },
      active: {
        src: source().active,
        tests: tests().active,
        bin: bin().active,
        scripts: scripts().active,
        tooling: tooling().active,
      },
      // @debt library-only behavior should read the published trait (#153) instead of the library preset
      published: includes(presets(), "library"),
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
    const { entries } = buildSchema;

    function resolveOutDir() {
      return entries.outDir.resolve(raw.build?.outDir, context, "build.outDir");
    }

    // @debt build.outDir is resolved on access because its computed default reads the tsconfig, which can fail to parse, while declarations otherwise resolve a section as a whole
    return freeze(
      compose(
        {
          emptyOutDir: entries.emptyOutDir.resolve(
            raw.build?.emptyOutDir,
            context,
            "build.emptyOutDir",
          ),
          sourcemap: entries.sourcemap.resolve(
            raw.build?.sourcemap,
            context,
            "build.sourcemap",
          ),
          typed: entries.typed.resolve(
            raw.build?.typed,
            context,
            "build.typed",
          ),
        },
        compose.getters({
          outDir: resolveOutDir,
        }),
      ),
    );
  });

  const cache = cacheOption;

  const baseTsconfig = once(() => {
    const option = typescriptOption().tsconfig;

    return freeze(
      compose(
        {
          file: option.path.file,
          extends: option.extends,
          compilerOptions: option.compilerOptions,
          unmanaged: option.unmanaged,
        },
        compose.getters({
          path: tsconfigPath,
        }),
      ),
    );
  });

  const typescript = once(() => {
    const option = typescriptOption();

    return freeze(
      compose(
        {
          files: option.files,
        },
        compose.getters({
          tsconfig: baseTsconfig,
          envFile: () => resolveWithin(root, option.envFile),
        }),
      ),
    );
  });

  const git = once(() => {
    const { gitignore } = gitSchema.resolve(raw.git, context, "git");

    return freeze(
      compose(
        {},
        compose.getters({
          gitignore: () => locate(gitignore.file, gitignore.configured),
        }),
      ),
    );
  });

  const prettier = once(() => {
    const { prettierignore } = prettierSchema.resolve(
      raw.prettier,
      context,
      "prettier",
    );

    return freeze(
      compose(
        {},
        compose.getters({
          prettierignore: () => {
            return locate(prettierignore.file, prettierignore.configured);
          },
        }),
      ),
    );
  });

  const agents = once(() => {
    return agentsSchema.resolve(raw.agents, context, "agents");
  });

  const github = once(() => {
    return githubSchema.resolve(raw.github, context, "github");
  });

  const vscode = once(() => {
    return vscodeSchema.resolve(raw.vscode, context, "vscode");
  });

  function resolve(...paths: string[]): string {
    return resolveWithin(root, ...paths);
  }

  function cacheFor(packageName: PackageName): Directory {
    return resolveWithin(root, cache().dir, packageName);
  }

  const config: ResolvedConfig = freeze(
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
        debug: () => {
          return debugOption() || isDebugEnvironment();
        },
        packageJsonPath,
        packageJson,
        tsconfig,
        environment,
        presets,
        roles,
        runtime,
        define,
        src: source,
        tests,
        bin,
        scripts,
        data,
        tooling,
        structure,
        importRules,
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

  return config;
}
