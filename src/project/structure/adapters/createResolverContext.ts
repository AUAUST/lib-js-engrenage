import { entries, freeze, getOwn } from "@auaust/toolkit/object";

import {
  flattenStructure,
  listDeclaredOptionPaths,
  listKindConflictPaths,
} from "#batiment/structure/index";
import {
  listEnvironmentEntries,
  readEnvironmentOptions,
  readScopeNamespaces,
  type ContributedEnvironmentEntry,
} from "#project/environments/index";
import { readEnvironmentRoles } from "#project/structure/operations/readEnvironmentRoles";
import { readStructureOption } from "#project/structure/operations/readStructureOption";
import type {
  ContextPort,
  MatchedWorkspace,
  NamespaceDeclarations,
  NamespacePlacement,
  RootFacts,
  ScopeDeclarations,
  ScopeRegistry,
  WorkspaceExpectation,
} from "#batiment/context/index";
import type { EnvironmentRegistration } from "#batiment/environments/index";
import type { OptionSource } from "#batiment/report/index";
import type { ValueOrigin } from "#foundation/options/index";
import type { ConfigResolver } from "#project/config/index";
import type { Directory } from "#types/Directory";

async function readPlacement(
  config: ConfigResolver,
  { entry: { name, title } }: ContributedEnvironmentEntry,
): Promise<NamespacePlacement> {
  const { key, option } = await readEnvironmentOptions(config, name);

  const path = `${name}.kind`;

  return freeze({
    name,
    title,
    kind: freeze({
      value: option.kind ?? name,
      config: freeze({
        key,
        path,
        ...(option.kind === undefined
          ? {}
          : { origin: await config.origin(key, path) }),
      }),
    }),
    dirs: option.dirs,
    files: option.files ?? [],
  });
}

/**
 * Finds the option the registration's `dirs` come from: its `environments` entry
 * when a layer sets it, else a built-in's options.
 */
async function readDirsSource(
  config: ConfigResolver,
  name: string,
  builtIn: boolean,
): Promise<OptionSource> {
  const path = `environments.${name}.dirs`;

  const origin = await config.origin("environments", path);

  if (origin.layer !== "declaration" || !builtIn) {
    return freeze({
      key: "environments",
      path,
      origin,
    });
  }

  const { key } = await readEnvironmentOptions(config, name);

  const option = `${name}.dirs`;

  return freeze({
    key,
    path: option,
    origin: await config.origin(key, option),
  });
}

async function readRegistrations(
  config: ConfigResolver,
  entries: readonly ContributedEnvironmentEntry[],
): Promise<readonly EnvironmentRegistration[]> {
  const registrations = await config.resolve("environments");

  const builtIns = new Set(entries.map(({ entry }) => entry.name));

  return freeze(
    await Promise.all(
      registrations.map(async (registration) => {
        const { name } = registration;

        return freeze({
          ...registration,
          dirsSource: await readDirsSource(config, name, builtIns.has(name)),
        });
      }),
    ),
  );
}

async function readWorkspaceExpectations(
  config: ConfigResolver,
): Promise<readonly WorkspaceExpectation[]> {
  const options = await config.resolve("workspaces.options");

  return Promise.all(
    entries(options).map(
      async ([glob, { purpose }]): Promise<WorkspaceExpectation> => {
        if (purpose === undefined) {
          return freeze({ glob });
        }

        const path = `workspaces.${glob}.purpose`;

        return freeze({
          glob,
          purpose: freeze({
            value: purpose,
            config: freeze({
              key: "workspaces.options",
              path,
              // @debt the origin path splits on dots, so a glob holding one resolves another path's origin
              origin: await config.origin("workspaces.options", path),
            }),
          }),
        });
      },
    ),
  );
}

async function readOrigins(
  config: ConfigResolver,
  key: string,
  paths: readonly string[],
): Promise<ReadonlyMap<string, ValueOrigin>> {
  const unique = [...new Set(paths)];

  const origins = await Promise.all(
    unique.map(async (path) => {
      return [path, await config.origin(key, path)] as const;
    }),
  );

  return new Map(origins);
}

async function readNamespaceDeclarations(
  config: ConfigResolver,
  name: string,
  published: boolean,
): Promise<NamespaceDeclarations> {
  const key = `${name}.options`;

  const { option, layout } = await readStructureOption(config, name);

  if (!option.enabled) {
    return {
      name,
      key,
      option,
      layout,
      roles: undefined,
      declared: undefined,
      origins: new Map(),
    };
  }

  const root = `${name}.structure`;

  const kindOrigins = await readOrigins(
    config,
    key,
    listKindConflictPaths({ root, structure: option.structure }),
  );

  const declared = flattenStructure({
    namespaceName: name,
    root,
    structure: option.structure,
    published,
    origins: kindOrigins,
  });

  const origins = layout?.nature === "derived"
    ? new Map<string, ValueOrigin>()
    : await readOrigins(
        config,
        key,
        listDeclaredOptionPaths({
          declared,
          optionPaths: declared.optionPaths,
        }),
      );

  return {
    name,
    key,
    option,
    layout,
    roles: await readEnvironmentRoles(config, name),
    declared,
    origins,
  };
}

async function readScopeRegistry(
  config: ConfigResolver,
): Promise<ScopeRegistry> {
  const [entries, claims, kinds, presets] = await Promise.all([
    listEnvironmentEntries(config),
    config.resolve("environments.claims"),
    config.resolve("namespaceKinds"),
    config.resolve("environmentPresets"),
  ]);

  return freeze({
    kinds,
    presets,
    namespaces: freeze(
      await Promise.all(
        entries.map((contributed) => readPlacement(config, contributed)),
      ),
    ),
    environments: await readRegistrations(config, entries),
    claims,
  });
}

/**
 * Answers the context port from the config resolver: the root's facts from the
 * raw options keys, each with the option it comes from where a metafile may
 * override it, each workspace's registry from its child resolver, created from
 * the workspace's facts, and each scope's declarations from its config, the
 * root's or a workspace's child resolver, for its active top-level namespaces
 * named after an environment entry.
 */
export function createResolverContext(config: ConfigResolver): ContextPort {
  async function root(): Promise<RootFacts> {
    const [repository, registry, workspaces] = await Promise.all([
      config.resolve("git"),
      readScopeRegistry(config),
      readWorkspaceExpectations(config),
    ]);

    return freeze({
      ...registry,
      ignored: await repository.ignored,
      workspaces: freeze(workspaces),
    });
  }

  async function registry(workspace: MatchedWorkspace): Promise<ScopeRegistry> {
    return readScopeRegistry(await config.context.workspace(workspace));
  }

  async function scope(dir: Directory): Promise<ScopeDeclarations> {
    const scoped = await config.context.scope(dir);

    const [
      entries,
      namespaces,
      { internals },
      { published },
    ] = await Promise.all([
      listEnvironmentEntries(scoped),
      readScopeNamespaces(scoped),
      scoped.resolve("structure.options"),
      scoped.resolve("traits"),
    ]);

    const structured = entries.filter(({ entry }) => {
      const discovered = getOwn(namespaces, entry.name);

      return (
        discovered?.active === true && discovered.kind.structure !== undefined
      );
    });

    return freeze({
      internals,
      namespaces: freeze(
        await Promise.all(
          structured.map(({ entry }) => {
            return readNamespaceDeclarations(scoped, entry.name, published);
          }),
        ),
      ),
    });
  }

  return {
    root,
    registry,
    scope,
  };
}
