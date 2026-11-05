import { flatMap, isNotEmpty } from "@auaust/primitive-kit/arrays";
import { compose } from "@auaust/toolkit/composer";
import { isPlainObject } from "@auaust/toolkit/isPlainObject";
import { memoized } from "@auaust/toolkit/memoized";
import { freeze, get as getProperty, keys } from "@auaust/toolkit/object";
import { once } from "@auaust/toolkit/once";

import { packageJsonFile } from "#constants";
import {
  filesIn,
  findDirectories,
  resolveWithin,
  type Filesystem,
} from "#foundation/filesystem/index";
import {
  resolveSection,
  validate,
  type SectionResolvers,
} from "#foundation/options/index";
import {
  resolveNodeRuntime,
  resolveSourceRuntime,
} from "#project/baseline/index";
import { buildSchema } from "#project/build/index";
import { cacheSchema } from "#project/config/config/schemas/cacheSchema";
import { debugSchema } from "#project/config/config/schemas/debugSchema";
import { defineSchema } from "#project/config/config/schemas/defineSchema";
import {
  distTestsVariant,
  sourceTestsVariant,
} from "#project/config/constants";
import { isDebugEnvironment } from "#project/config/operations/isDebugEnvironment";
import { locateFile } from "#project/config/utils/locateFile";
import {
  binSchema,
  dataSchema,
  resolveCodeEnvironment,
  runtimeSchema,
  scriptsSchema,
  sourceSchema,
  testsSchema,
  toolingSchema,
} from "#project/environments/index";
import { formatSchema } from "#project/format/index";
import { createPackageJson, type PackageJson } from "#project/package/index";
import {
  presetSchema,
  resolveTraits,
  traitsSchema,
} from "#project/presets/index";
import { noRoles } from "#project/structure/constants";
import {
  aliasesSchema,
  listDiscoveredGlobs,
  normalizeNamespaces,
  normalizeRoles,
  resolveAliases,
  resolveDomainEntries,
  resolveEnvironmentStructure,
  resolveImportRules,
  resolveRoles,
  rolesSchema,
  type DeclaredRolesOption,
  type EnvironmentStructure,
  type ProgramLayout,
  type ProjectRoles,
  type ResolvedRoles,
  type RoleEnvironment,
  type RoleReference,
  type StructureEnvironmentName,
  type StructureOptions,
  type TestsContext,
} from "#project/structure/index";
import {
  createTsconfig,
  resolveTsconfig,
  typescriptSchema,
  unmanagedTsconfig,
  type ResolvedEnvironmentTsconfig,
  type ResolvedEnvironmentTsconfigOption,
  type Tsconfig,
  type TsconfigGroups,
  type TsconfigKey,
} from "#project/tsconfig/index";
import { resolveWorkspaces, workspacesSchema } from "#project/workspaces/index";
import type { ConfigContext } from "#project/config/types/ConfigContext";
import type { Environment } from "#project/config/types/Environment";
import type { ProjectConfig } from "#project/config/types/ProjectConfig";
import type { RawConfig } from "#project/config/types/RawConfig";
import type { ResolvedRuntimeSettings } from "#project/config/types/ResolvedRuntimeSettings";
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

// @debt one 850-line factory resolves the sections of every `project` domain, so `project/config` stays the aggregate hub the layering meant to remove; each domain could contribute its own section resolvers for the registry to compose
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
  type Get = ConfigContext["get"];

  function locate(file: File, configured: boolean): Promise<File | undefined> {
    return locateFile({ root, filesystem }, file, configured);
  }

  const debugOption = once(() => {
    return resolveSection(debugSchema, raw.debug, undefined, "debug");
  });

  function preset() {
    return resolveSection(presetSchema, raw.preset, undefined, "preset");
  }

  function traitAdjustments() {
    return resolveSection(traitsSchema, raw.traits, undefined, "traits");
  }

  async function traits(get: Get) {
    return resolveTraits(await get("preset"), await get("traitAdjustments"));
  }

  function format() {
    return resolveSection(formatSchema, raw.format, undefined, "format");
  }

  async function roles(get: Get): Promise<ProjectRoles> {
    const declared = resolveSection(rolesSchema, raw.roles, undefined, "roles");

    const traits = await get("traits");

    return freeze({
      ...normalizeRoles(declared),
      enabled: declared.enabled,
      verbatimModuleSyntax: typescriptOption().verbatimModuleSyntax,
      published: traits.published,
    });
  }

  async function define() {
    return resolveSection(
      defineSchema,
      raw.define,
      {
        root,
        configFile,
        packageJson: await packageJson(),
        filesystem,
      },
      "define",
    );
  }

  const cacheOption = once(() => {
    return resolveSection(cacheSchema, raw.cache, { root }, "cache");
  });

  const runtimeOption = once(() => {
    return resolveSection(runtimeSchema, raw.runtime, undefined, "runtime");
  });

  const typescriptOption = once(() => {
    return resolveSection(
      typescriptSchema,
      raw.typescript,
      undefined,
      "typescript",
    );
  });

  const sourceOption = once(() => {
    return resolveSection(sourceSchema, raw.src, undefined, "src");
  });

  const testsOption = once(() => {
    return resolveSection(testsSchema, raw.tests, undefined, "tests");
  });

  async function binOption(get: Get) {
    return resolveSection(
      binSchema,
      raw.bin,
      { runtime: await get("runtime") },
      "bin",
    );
  }

  const scriptsOption = once(() => {
    return resolveSection(scriptsSchema, raw.scripts, undefined, "scripts");
  });

  const toolingOption = once(() => {
    return resolveSection(toolingSchema, raw.tooling, undefined, "tooling");
  });

  const dataOption = once(() => {
    return resolveSection(dataSchema, raw.data, undefined, "data");
  });

  function packageJsonPath(): Promise<File | undefined> {
    return locate(packageJsonFile, false);
  }

  const parsePackageJson = memoized(
    (path: File | undefined, content: string | undefined) => {
      return createPackageJson({
        root,
        path,
        content,
      });
    },
    (path, content) => `${path}\0${content}`,
  );

  const describeEnvironment = memoized(createEnvironment);

  async function packageJson(): Promise<PackageJson> {
    const path = await packageJsonPath();

    return parsePackageJson(
      path,
      path === undefined ? undefined : await filesystem.read(path),
    );
  }

  async function environment(get: Get): Promise<Environment> {
    return describeEnvironment(await get("packageJson"));
  }

  function tsconfigPath(): Promise<File | undefined> {
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

  async function tsconfig(): Promise<Tsconfig> {
    const path = await tsconfigPath();

    return parseTsconfig(
      path,
      path === undefined ? undefined : await filesystem.read(path),
    );
  }

  function runtime() {
    return freeze({ node: runtimeOption().node });
  }

  function developmentRuntime({ node }: ResolvedRuntimeSettings) {
    return resolveNodeRuntime(node, "runtime.node");
  }

  async function resolveEnvironmentRoles(
    get: Get,
    name: RoleEnvironment,
    option: { readonly enabled: boolean; readonly roles?: DeclaredRolesOption },
  ): Promise<ResolvedRoles> {
    return option.enabled && option.roles !== undefined
      ? resolveRoles({
          environment: name,
          roles: await get("roles"),
          environmentRoles: normalizeRoles(option.roles),
        })
      : noRoles;
  }

  function layoutOf(option: {
    readonly enabled: boolean;
    readonly layout?: ProgramLayout;
  }): ProgramLayout | undefined {
    return option.enabled ? option.layout : undefined;
  }

  async function resolveStructure(
    get: Get,
    name: StructureEnvironmentName,
    environment: { active: boolean; dirs: Directories },
    option: StructureSection,
    extra: {
      tests?: TestsContext;
      layout?: ProgramLayout | undefined;
    } = {},
  ): Promise<EnvironmentStructure | undefined> {
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
      roles: await get("roles"),
      environmentRoles:
        environmentRoles === undefined
          ? undefined
          : freeze({
              ...environmentRoles,
              define: freeze({ ...environmentRoles.define, ...define }),
            }),
      ...extra,
    });
  }

  // @debt explicitness is read from the raw input because a resolved option no longer tells a default from a given value; the tests.dist tsconfig default should depend on the published trait in its declaration
  async function testsDistTsconfig(
    get: Get,
  ): Promise<ResolvedEnvironmentTsconfigOption> {
    const { tests } = raw;

    const configured =
      isPlainObject(tests) &&
      isPlainObject(tests.dist) &&
      tests.dist.tsconfig !== undefined;

    const traits = await get("traits");

    return configured || traits.published
      ? testsOption().dist.tsconfig
      : unmanagedTsconfig;
  }

  async function tsconfigGroups(get: Get): Promise<TsconfigGroups> {
    const binOptions = await binOption(get);

    return {
      "src": sourceOption().tsconfig,
      "tests": testsOption().tsconfig,
      "tests.dist": await testsDistTsconfig(get),
      "bin": binOptions.tsconfig,
      "scripts": scriptsOption().tsconfig,
      "tooling": toolingOption().tsconfig,
    };
  }

  async function environmentTsconfigFor(
    get: Get,
    key: TsconfigKey,
  ): Promise<ResolvedEnvironmentTsconfig> {
    const { location, ...resolved } = resolveTsconfig(
      key,
      await tsconfigGroups(get),
    );

    function path(): Promise<File | undefined> {
      return location === undefined
        ? Promise.resolve(undefined)
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

  async function resolveEnvironment(
    get: Get,
    option: {
      dirs: Directories;
      generated: Globs;
      discovered: Globs;
      defines: boolean;
    },
    key: TsconfigKey,
  ) {
    return freeze({
      ...(await resolveCodeEnvironment({
        ...option,
        typescriptFiles: typescriptFiles(),
        filesystem,
      })),
      tsconfig: await environmentTsconfigFor(get, key),
    });
  }

  async function source(get: Get) {
    const option = sourceOption();
    const environment = await resolveEnvironment(get, option, "src");

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
          roles: await resolveEnvironmentRoles(get, "src", option),
          bundled: option.bundled,
          apis: option.apis,
        },
        compose.getters({
          exports: once(() => resolveSourceExports(option.exports)),
          runtime,
        }),
      ),
    );
  }

  async function resolveSourceExports(
    configured: Readonly<Record<string, File>> | undefined,
  ): Promise<Readonly<Record<string, File>> | undefined> {
    const structure = await context.get("structure");

    const derived = resolveDomainEntries(structure.src);

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

  async function bin(get: Get) {
    const option = await binOption(get);

    return freeze(
      compose(
        {
          roles: noRoles,
          commands: option.commands,
        },
        compose.values(await resolveEnvironment(get, option, "bin")),
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

  async function scripts(get: Get) {
    const runtimeSettings = await get("runtime");
    const option = scriptsOption();

    return freeze(
      compose(
        {
          roles: await resolveEnvironmentRoles(get, "scripts", option),
        },
        compose.values(await resolveEnvironment(get, option, "scripts")),
        compose.getters({
          runtime: () => developmentRuntime(runtimeSettings),
        }),
      ),
    );
  }

  async function tests(get: Get) {
    const runtimeSettings = await get("runtime");
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
          roles: await resolveEnvironmentRoles(get, "tests", option),
          layout: option.enabled ? option.layout : "roots",
          patterns,
          files: [...patterns.plain, ...patterns.source, ...patterns.dist],
          fixtures: option.fixtures,
          coverageDir: option.coverageDir,
          dist: freeze({
            tsconfig: await environmentTsconfigFor(get, "tests.dist"),
          }),
        },
        compose.values(await resolveEnvironment(get, option, "tests")),
        compose.getters({
          runtime: () => developmentRuntime(runtimeSettings),
        }),
      ),
    );
  }

  async function tooling(get: Get) {
    const runtimeSettings = await get("runtime");
    const option = toolingOption();
    const { files } = option;
    const walked = option.dirs.filter((directory) => directory !== ".");
    const rootFiles = walked.length === option.dirs.length ? [] : files;

    return freeze(
      compose(
        {
          active: isNotEmpty(await findDirectories(filesystem, option.dirs)),
          dirs: walked,
          files: rootFiles,
          defines: false,
          globs: [...rootFiles, ...filesIn(walked, typescriptFiles())],
          roles: await resolveEnvironmentRoles(get, "tooling", option),
          tsconfig: await environmentTsconfigFor(get, "tooling"),
        },
        compose.getters({
          runtime: () => developmentRuntime(runtimeSettings),
        }),
      ),
    );
  }

  const workspacesOption = once(() => {
    return resolveSection(
      workspacesSchema,
      raw.workspaces,
      undefined,
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

  async function structure(get: Get) {
    const [source, bin, scripts, tests, tooling] = await Promise.all([
      get("src"),
      get("bin"),
      get("scripts"),
      get("tests"),
      get("tooling"),
    ]);

    const sourceStructure = await resolveStructure(
      get,
      "src",
      source,
      sourceOption(),
    );

    const binOptions = await binOption(get);

    const binStructure = await resolveStructure(get, "bin", bin, binOptions, {
      layout: layoutOf(binOptions),
    });

    const scriptsStructure = await resolveStructure(
      get,
      "scripts",
      scripts,
      scriptsOption(),
      { layout: layoutOf(scriptsOption()) },
    );

    const toolingStructure = await resolveStructure(
      get,
      "tooling",
      tooling,
      toolingOption(),
    );

    const testsConfig = testsOption();

    return freeze({
      src: sourceStructure,
      tests: await resolveStructure(
        get,
        "tests",
        tests,
        testsConfig,
        testsConfig.enabled
          ? {
              tests: {
                layout: testsConfig.layout,
                environments: {
                  src: {
                    dirs: source.dirs,
                    structure: sourceStructure,
                  },
                  bin: {
                    dirs: bin.dirs,
                    structure: binStructure,
                  },
                  scripts: {
                    dirs: scripts.dirs,
                    structure: scriptsStructure,
                  },
                  tooling: {
                    dirs: tooling.dirs,
                    structure: toolingStructure,
                  },
                },
              },
            }
          : {},
      ),
      bin: binStructure,
      scripts: scriptsStructure,
      tooling: toolingStructure,
    });
  }

  async function importRules(get: Get) {
    const [trees, source, tests, bin, scripts, tooling, traits, groups] =
      await Promise.all([
        get("structure"),
        get("src"),
        get("tests"),
        get("bin"),
        get("scripts"),
        get("tooling"),
        get("traits"),
        get("workspaces"),
      ]);

    return resolveImportRules({
      structures: {
        ...(trees.src === undefined ? {} : { src: trees.src }),
        ...(trees.tests === undefined ? {} : { tests: trees.tests }),
        ...(trees.bin === undefined ? {} : { bin: trees.bin }),
        ...(trees.scripts === undefined ? {} : { scripts: trees.scripts }),
        ...(trees.tooling === undefined ? {} : { tooling: trees.tooling }),
      },
      roles: {
        src: source.roles,
        tests: tests.roles,
        scripts: scripts.roles,
        tooling: tooling.roles,
      },
      active: {
        src: source.active,
        tests: tests.active,
        bin: bin.active,
        scripts: scripts.active,
        tooling: tooling.active,
      },
      published: traits.published,
      workspaces: flatMap(groups, ({ workspaces }) => workspaces),
    });
  }

  async function readOutDir(get: Get): Promise<Directory | undefined> {
    try {
      const build = await get("build");

      return await build.outDir;
    } catch {
      // @debt an unreadable tsconfig hides the output directory, so its alias is generated instead of skipped; the output directory should resolve without parsing the tsconfig
    }
  }

  async function aliases(get: Get) {
    const option = sourceOption();

    const global = resolveSection(
      aliasesSchema,
      raw.aliases,
      undefined,
      "aliases",
    );

    const [source, tests, bin, scripts, tooling, data, traits, trees] =
      await Promise.all([
        get("src"),
        get("tests"),
        get("bin"),
        get("scripts"),
        get("tooling"),
        get("data"),
        get("traits"),
        get("structure"),
      ]);

    return resolveAliases({
      root,
      options: { global, src: option.aliases },
      bundled: option.bundled,
      environments: {
        src: source.dirs,
        tests: tests.dirs,
        bin: bin.dirs,
        scripts: scripts.dirs,
        tooling: tooling.dirs,
      },
      data: data.active ? data.dirs : [],
      published: traits.published,
      outDir: await readOutDir(get),
      structure: trees.src,
    });
  }

  async function files(get: Get) {
    const [source, tests, bin, scripts, groups] = await Promise.all([
      get("src"),
      get("tests"),
      get("bin"),
      get("scripts"),
      get("workspaces"),
    ]);

    const environments = [source, tests, bin, scripts];

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
      fixtures: filesIn(tests.dirs, tests.fixtures),
      published: [...source.globs, ...bin.globs],
      private: [
        ...tests.globs,
        ...scripts.globs,
        ...flatMap(groups, ({ globs }) => globs),
      ],
    });
  }

  async function build(get: Get) {
    const { entries } = buildSchema;

    const input = validate(buildSchema.schema, raw.build, "build config");

    const buildContext = { get: context.get, define: await get("define") };

    function resolveOutDir() {
      return entries.outDir.resolve(
        input?.outDir,
        buildContext,
        "build.outDir",
      );
    }

    // @debt build.outDir is resolved on access because its computed default reads the tsconfig, which can fail to parse, while declarations otherwise resolve a section as a whole
    return freeze(
      compose(
        {
          clean: entries.clean.resolve(
            input?.clean,
            buildContext,
            "build.clean",
          ),
          sourcemap: entries.sourcemap.resolve(
            input?.sourcemap,
            buildContext,
            "build.sourcemap",
          ),
          typed: entries.typed.resolve(
            input?.typed,
            buildContext,
            "build.typed",
          ),
        },
        compose.getters({
          outDir: resolveOutDir,
        }),
      ),
    );
  }

  const cache = cacheOption;

  const baseTsconfig = once(() => {
    const { tsconfig: option, verbatimModuleSyntax } = typescriptOption();

    const configured = getProperty(
      option.compilerOptions,
      "verbatimModuleSyntax",
    );

    if (configured !== undefined && configured !== verbatimModuleSyntax) {
      throw new Error(
        `typescript.tsconfig.compilerOptions.verbatimModuleSyntax contradicts typescript.verbatimModuleSyntax (${verbatimModuleSyntax}): set the second option only`,
      );
    }

    return freeze(
      compose(
        {
          file: option.path.file,
          extends: option.extends,
          compilerOptions: verbatimModuleSyntax
            ? option.compilerOptions
            : { ...option.compilerOptions, verbatimModuleSyntax },
          unmanaged: option.unmanaged,
        },
        compose.getters({
          path: () => Promise.try(tsconfigPath),
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
          verbatimModuleSyntax: option.verbatimModuleSyntax,
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
