import { flatMap } from "@auaust/primitive-kit/arrays";
import { compose } from "@auaust/toolkit/composer";
import { isPlainObject } from "@auaust/toolkit/isPlainObject";
import { memoized } from "@auaust/toolkit/memoized";
import { freeze, keys } from "@auaust/toolkit/object";
import { once } from "@auaust/toolkit/once";

import { packageJsonFile } from "#constants";
import { filesIn } from "#foundation/filesystem/utils/filesIn";
import { resolveWithin } from "#foundation/filesystem/utils/resolveWithin";
import { resolveSection } from "#foundation/options/utils/resolveSection";
import { validate } from "#foundation/options/utils/validate";
import { resolveSourceRuntime } from "#project/baseline/operations/resolveSourceRuntime";
import { resolveNodeRuntime } from "#project/baseline/utils/resolveNodeRuntime";
import { buildSchema } from "#project/build/config/schemas/buildSchema";
import { cacheSchema } from "#project/config/config/schemas/core/cacheSchema";
import { debugSchema } from "#project/config/config/schemas/core/debugSchema";
import { defineSchema } from "#project/config/config/schemas/core/defineSchema";
import {
  distTestsVariant,
  sourceTestsVariant,
  unmanagedTsconfig,
} from "#project/config/constants";
import { isDebugEnvironment } from "#project/config/operations/isDebugEnvironment";
import { locateFile } from "#project/config/utils/locateFile";
import { binSchema } from "#project/environments/config/schemas/binSchema";
import { dataSchema } from "#project/environments/config/schemas/dataSchema";
import { runtimeSchema } from "#project/environments/config/schemas/runtimeSchema";
import { scriptsSchema } from "#project/environments/config/schemas/scriptsSchema";
import { sourceSchema } from "#project/environments/config/schemas/sourceSchema";
import { testsSchema } from "#project/environments/config/schemas/testsSchema";
import { toolingSchema } from "#project/environments/config/schemas/toolingSchema";
import { resolveCodeEnvironment } from "#project/environments/operations/resolveCodeEnvironment";
import { formatSchema } from "#project/format/config/schemas/formatSchema";
import { createPackageJson } from "#project/package/operations/createPackageJson";
import { presetSchema } from "#project/presets/config/schemas/presetSchema";
import { traitsSchema } from "#project/presets/config/schemas/traitsSchema";
import { resolveTraits } from "#project/presets/index";
import { aliasesSchema } from "#project/structure/config/schemas/aliasesSchema";
import { rolesSchema } from "#project/structure/config/schemas/rolesSchema";
import { noRoles } from "#project/structure/constants";
import { resolveAliases } from "#project/structure/operations/resolveAliases";
import { resolveEnvironmentStructure } from "#project/structure/operations/resolveEnvironmentStructure";
import { resolveImportRules } from "#project/structure/operations/resolveImportRules";
import { resolveRoles } from "#project/structure/operations/resolveRoles";
import { listDiscoveredGlobs } from "#project/structure/utils/listDiscoveredGlobs";
import { normalizeNamespaces } from "#project/structure/utils/normalizeNamespaces";
import { normalizeRoles } from "#project/structure/utils/normalizeRoles";
import { resolveDomainEntries } from "#project/structure/utils/resolveDomainEntries";
import { typescriptSchema } from "#project/tsconfig/config/schemas/typescriptSchema";
import { createTsconfig } from "#project/tsconfig/operations/createTsconfig";
import { resolveTsconfig } from "#project/tsconfig/utils/resolveTsconfig";
import { workspacesSchema } from "#project/workspaces/config/schemas/workspacesSchema";
import { resolveWorkspaces } from "#project/workspaces/operations/resolveWorkspaces";
import type { Filesystem } from "#foundation/filesystem/types/Filesystem";
import type { SectionResolvers } from "#foundation/options/types/SectionResolvers";
import type { ConfigContext } from "#project/config/types/ConfigContext";
import type { Environment } from "#project/config/types/Environment";
import type { ProjectConfig } from "#project/config/types/ProjectConfig";
import type { RawConfig } from "#project/config/types/RawConfig";
import type { PackageJson } from "#project/package/types/PackageJson";
import type { DeclaredRolesOption } from "#project/structure/types/DeclaredRolesOption";
import type { EnvironmentStructure } from "#project/structure/types/EnvironmentStructure";
import type { ProjectRoles } from "#project/structure/types/ProjectRoles";
import type { ResolvedRoles } from "#project/structure/types/ResolvedRoles";
import type { RoleEnvironment } from "#project/structure/types/RoleEnvironment";
import type { RoleReference } from "#project/structure/types/RoleReference";
import type { StructureEnvironmentName } from "#project/structure/types/StructureEnvironmentName";
import type { StructureOptions } from "#project/structure/types/StructureOptions";
import type { TestsContext } from "#project/structure/types/TestsContext";
import type { ResolvedEnvironmentTsconfig } from "#project/tsconfig/types/ResolvedEnvironmentTsconfig";
import type { ResolvedEnvironmentTsconfigOption } from "#project/tsconfig/types/ResolvedEnvironmentTsconfigOption";
import type { Tsconfig } from "#project/tsconfig/types/Tsconfig";
import type { TsconfigGroups } from "#project/tsconfig/types/TsconfigGroups";
import type { TsconfigKey } from "#project/tsconfig/types/TsconfigKey";
import type { Directories } from "#types/Directories";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";
import type { Globs } from "#types/Globs";
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

type StructureSection =
  | { readonly enabled: false }
  | ({
      readonly enabled: true;
      readonly roles?: DeclaredRolesOption;
    } & StructureOptions<RoleReference>);

export function createProjectSections({
  root,
  raw,
  configFile,
  filesystem,
  context,
}: {
  root: Directory;
  raw: RawConfig;
  configFile: File | undefined;
  filesystem: Filesystem;
  context: ConfigContext;
}): SectionResolvers<ProjectConfig> {
  const { get } = context;

  function locate(file: File, configured: boolean): File | undefined {
    return locateFile({ root, filesystem }, file, configured);
  }

  const debugOption = once(() => {
    return resolveSection(debugSchema, raw.debug, context, "debug");
  });

  function preset() {
    return resolveSection(presetSchema, raw.preset, context, "preset");
  }

  function traitAdjustments() {
    return resolveSection(traitsSchema, raw.traits, context, "traits");
  }

  function traits() {
    return resolveTraits(get("preset"), get("traitAdjustments"));
  }

  function format() {
    return resolveSection(formatSchema, raw.format, context, "format");
  }

  function roles(): ProjectRoles {
    const declared = resolveSection(rolesSchema, raw.roles, context, "roles");

    return freeze({
      ...normalizeRoles(declared),
      enabled: declared.enabled,
    });
  }

  function define() {
    return resolveSection(defineSchema, raw.define, context, "define");
  }

  const cacheOption = once(() => {
    return resolveSection(cacheSchema, raw.cache, context, "cache");
  });

  const runtimeOption = once(() => {
    return resolveSection(runtimeSchema, raw.runtime, context, "runtime");
  });

  const typescriptOption = once(() => {
    return resolveSection(
      typescriptSchema,
      raw.typescript,
      context,
      "typescript",
    );
  });

  const sourceOption = once(() => {
    return resolveSection(sourceSchema, raw.src, context, "src");
  });

  const testsOption = once(() => {
    return resolveSection(testsSchema, raw.tests, context, "tests");
  });

  const binOption = once(() => {
    return resolveSection(binSchema, raw.bin, context, "bin");
  });

  const scriptsOption = once(() => {
    return resolveSection(scriptsSchema, raw.scripts, context, "scripts");
  });

  const toolingOption = once(() => {
    return resolveSection(toolingSchema, raw.tooling, context, "tooling");
  });

  const dataOption = once(() => {
    return resolveSection(dataSchema, raw.data, context, "data");
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
    return describeEnvironment(get("packageJson"));
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

  function runtime() {
    return freeze({ node: runtimeOption().node });
  }

  function developmentRuntime() {
    return resolveNodeRuntime(get("runtime").node, "runtime.node");
  }

  function resolveEnvironmentRoles(
    name: RoleEnvironment,
    option: { readonly enabled: boolean; readonly roles?: DeclaredRolesOption },
  ): ResolvedRoles {
    return option.enabled && option.roles !== undefined
      ? resolveRoles({
          environment: name,
          roles: get("roles"),
          environmentRoles: normalizeRoles(option.roles),
        })
      : noRoles;
  }

  function resolveStructure(
    name: StructureEnvironmentName,
    environment: { active: boolean; dirs: Directories },
    option: StructureSection,
    tests?: TestsContext,
  ): EnvironmentStructure | undefined {
    if (!option.enabled || !environment.active) {
      return;
    }

    const { namespaces, define } = normalizeNamespaces({
      environment: name,
      namespaces: option.namespaces,
    });

    const environmentRoles =
      option.roles === undefined ? undefined : normalizeRoles(option.roles);

    return resolveEnvironmentStructure({
      name,
      root,
      dirs: environment.dirs,
      options: { ...option, namespaces },
      roles: get("roles"),
      environmentRoles:
        environmentRoles === undefined
          ? undefined
          : freeze({
              ...environmentRoles,
              define: freeze({ ...environmentRoles.define, ...define }),
            }),
      ...(tests === undefined ? {} : { tests }),
    });
  }

  // @debt explicitness is read from the raw input because a resolved option no longer tells a default from a given value; the tests.dist tsconfig default should depend on the published trait in its declaration
  function testsDistTsconfig(): ResolvedEnvironmentTsconfigOption {
    const { tests } = raw;

    const configured =
      isPlainObject(tests) &&
      isPlainObject(tests.dist) &&
      tests.dist.tsconfig !== undefined;

    return configured || get("traits").published
      ? testsOption().dist.tsconfig
      : unmanagedTsconfig;
  }

  const tsconfigGroups = once((): TsconfigGroups => {
    return {
      "src": sourceOption().tsconfig,
      "tests": testsOption().tsconfig,
      "tests.dist": testsDistTsconfig(),
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

  function source() {
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
          bundled: option.bundled,
          apis: option.apis,
        },
        compose.getters({
          exports: () => resolveSourceExports(option.exports),
          runtime,
        }),
      ),
    );
  }

  function resolveSourceExports(
    configured: Readonly<Record<string, File>> | undefined,
  ): Readonly<Record<string, File>> | undefined {
    const derived = resolveDomainEntries(get("structure").src);

    for (const subpath of keys(configured ?? {})) {
      if (subpath in derived) {
        throw new Error(
          `Subpath '${subpath}' is exposed by src.exports and by the public domain ${derived[subpath]}: remove it from src.exports`,
        );
      }
    }

    const exposed = { ...configured, ...derived };

    return keys(exposed).length === 0 ? undefined : freeze(exposed);
  }

  function bin() {
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
  }

  function data() {
    const option = dataOption();

    return freeze({
      active: option.enabled,
      roles: noRoles,
      dirs: option.dirs,
      exports: option.exports,
    });
  }

  function scripts() {
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
  }

  function tests() {
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
          layout: option.enabled ? option.layout : "roots",
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
  }

  function tooling() {
    const option = toolingOption();
    const { files } = option;
    const walked = option.dirs.filter((directory) => directory !== ".");
    const rootFiles = walked.length === option.dirs.length ? [] : files;

    return freeze(
      compose(
        {
          active: option.dirs.some((directory) => {
            return filesystem.isDirectory(directory);
          }),
          dirs: walked,
          files: rootFiles,
          defines: false,
          globs: [...rootFiles, ...filesIn(walked, typescriptFiles())],
          roles: resolveEnvironmentRoles("tooling", option),
          tsconfig: environmentTsconfigFor("tooling"),
        },
        compose.getters({
          runtime: developmentRuntime,
        }),
      ),
    );
  }

  const workspacesOption = once(() => {
    return resolveSection(
      workspacesSchema,
      raw.workspaces,
      context,
      "workspaces",
    );
  });

  function workspaces() {
    return resolveWorkspaces({
      root,
      filesystem,
      options: workspacesOption(),
      typescriptFiles: typescriptFiles(),
    });
  }

  function structure() {
    const sourceStructure = resolveStructure("src", get("src"), sourceOption());
    const binStructure = resolveStructure("bin", get("bin"), binOption());

    const scriptsStructure = resolveStructure(
      "scripts",
      get("scripts"),
      scriptsOption(),
    );

    const toolingStructure = resolveStructure(
      "tooling",
      get("tooling"),
      toolingOption(),
    );

    const testsConfig = testsOption();

    return freeze({
      src: sourceStructure,
      tests: resolveStructure(
        "tests",
        get("tests"),
        testsConfig,
        testsConfig.enabled
          ? {
              layout: testsConfig.layout,
              environments: {
                src: {
                  dirs: get("src").dirs,
                  structure: sourceStructure,
                },
                bin: {
                  dirs: get("bin").dirs,
                  structure: binStructure,
                },
                scripts: {
                  dirs: get("scripts").dirs,
                  structure: scriptsStructure,
                },
                tooling: {
                  dirs: get("tooling").dirs,
                  structure: toolingStructure,
                },
              },
            }
          : undefined,
      ),
      bin: binStructure,
      scripts: scriptsStructure,
      tooling: toolingStructure,
    });
  }

  function importRules() {
    const trees = get("structure");

    return resolveImportRules({
      structures: {
        ...(trees.src === undefined ? {} : { src: trees.src }),
        ...(trees.tests === undefined ? {} : { tests: trees.tests }),
        ...(trees.bin === undefined ? {} : { bin: trees.bin }),
        ...(trees.scripts === undefined ? {} : { scripts: trees.scripts }),
        ...(trees.tooling === undefined ? {} : { tooling: trees.tooling }),
      },
      roles: {
        src: get("src").roles,
        tests: get("tests").roles,
        scripts: get("scripts").roles,
        tooling: get("tooling").roles,
      },
      active: {
        src: get("src").active,
        tests: get("tests").active,
        bin: get("bin").active,
        scripts: get("scripts").active,
        tooling: get("tooling").active,
      },
      published: get("traits").published,
      workspaces: flatMap(get("workspaces"), ({ workspaces }) => workspaces),
    });
  }

  function readOutDir(): Directory | undefined {
    try {
      return get("build").outDir;
    } catch {
      // @debt an unreadable tsconfig hides the output directory, so its alias is generated instead of skipped; the output directory should resolve without parsing the tsconfig
    }
  }

  function aliases() {
    const option = sourceOption();

    const global = resolveSection(
      aliasesSchema,
      raw.aliases,
      context,
      "aliases",
    );

    return resolveAliases({
      root,
      options: { global, src: option.aliases },
      bundled: option.bundled,
      environments: {
        src: get("src").dirs,
        tests: get("tests").dirs,
        bin: get("bin").dirs,
        scripts: get("scripts").dirs,
        tooling: get("tooling").dirs,
      },
      data: get("data").active ? get("data").dirs : [],
      published: get("traits").published,
      outDir: readOutDir(),
      structure: get("structure").src,
    });
  }

  function files() {
    const environments = [get("src"), get("tests"), get("bin"), get("scripts")];
    const groups = get("workspaces");

    return freeze({
      generated: [
        ...flatMap(environments, ({ dirs, generated }) => {
          return filesIn(dirs, generated);
        }),
        ...flatMap(groups, ({ dirs, generated }) => filesIn(dirs, generated)),
      ],
      discovered: [
        ...flatMap(environments, ({ dirs, discovered, roles }) => {
          return filesIn(dirs, [...discovered, ...listDiscoveredGlobs(roles)]);
        }),
        ...flatMap(groups, ({ dirs, discovered }) => {
          return filesIn(dirs, discovered);
        }),
      ],
      fixtures: filesIn(get("tests").dirs, get("tests").fixtures),
      published: [...source().globs, ...bin().globs],
      private: [
        ...tests().globs,
        ...scripts().globs,
        ...flatMap(groups, ({ globs }) => globs),
      ],
    });
  }

  function build() {
    const { entries } = buildSchema;

    const input = validate(buildSchema.schema, raw.build, "build config");

    function resolveOutDir() {
      return entries.outDir.resolve(input?.outDir, context, "build.outDir");
    }

    // @debt build.outDir is resolved on access because its computed default reads the tsconfig, which can fail to parse, while declarations otherwise resolve a section as a whole
    return freeze(
      compose(
        {
          clean: entries.clean.resolve(input?.clean, context, "build.clean"),
          sourcemap: entries.sourcemap.resolve(
            input?.sourcemap,
            context,
            "build.sourcemap",
          ),
          typed: entries.typed.resolve(input?.typed, context, "build.typed"),
        },
        compose.getters({
          outDir: resolveOutDir,
        }),
      ),
    );
  }

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

  function typescript() {
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
  }

  function resolve(...paths: string[]): string {
    return resolveWithin(root, ...paths);
  }

  function cacheFor(packageName: PackageName): Directory {
    return resolveWithin(root, cache().dir, packageName);
  }

  return {
    root: () => root,
    raw: () => raw,
    configFile: () => configFile,
    filesystem: () => filesystem,
    resolve: () => resolve,
    cacheFor: () => cacheFor,
    debug: () => {
      return debugOption() || isDebugEnvironment();
    },
    packageJsonPath,
    packageJson,
    tsconfig,
    environment,
    preset,
    traitAdjustments,
    traits,
    roles,
    format,
    runtime,
    define,
    src: source,
    tests,
    bin,
    scripts,
    data,
    tooling,
    workspaces,
    structure,
    aliases,
    importRules,
    files,
    build,
    cache,
    typescript,
  };
}
