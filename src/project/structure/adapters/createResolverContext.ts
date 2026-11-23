import { entries, freeze, getOwn } from "@auaust/toolkit/object";

import { rootScope } from "#batiment/scopes/constants";
import {
  flattenStructure,
  listDeclaredOptionPaths,
  listKindConflictPaths,
} from "#batiment/structure/index";
import {
  listEnvironmentEntries,
  readEnvironmentOptions,
  type ContributedEnvironmentEntry,
} from "#project/environments/index";
import { readEnvironmentRoles } from "#project/structure/operations/readEnvironmentRoles";
import { readStructureOption } from "#project/structure/operations/readStructureOption";
import type {
  ContextPort,
  NamespaceDeclarations,
  NamespacePlacement,
  RootFacts,
  ScopeDeclarations,
  WorkspaceExpectation,
} from "#batiment/context/index";
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

/**
 * Answers the context port from the config resolver: the root's facts from the
 * raw options keys, the root's declarations from its active environments; a
 * workspace declares nothing until its child resolver exists (#745).
 */
export function createResolverContext(config: ConfigResolver): ContextPort {
  async function root(): Promise<RootFacts> {
    const [
      repository,
      kinds,
      presets,
      languages,
      entries,
      environments,
      claims,
      workspaces,
    ] = await Promise.all([
      config.resolve("git"),
      config.context.registry.contributions("namespaceKinds", config),
      config.context.registry.contributions("environmentPresets", config),
      config.context.registry.contributions("languages", config),
      listEnvironmentEntries(config),
      config.resolve("environments"),
      config.resolve("environments.claims"),
      readWorkspaceExpectations(config),
    ]);

    return freeze({
      ignored: await repository.ignored,
      kinds: freeze(kinds.map(({ entry }) => entry)),
      presets: freeze(presets.map(({ entry }) => entry)),
      languages: freeze(languages.map(({ entry }) => entry.name)),
      namespaces: freeze(
        await Promise.all(
          entries.map((contributed) => readPlacement(config, contributed)),
        ),
      ),
      environments,
      claims,
      workspaces: freeze(workspaces),
    });
  }

  async function scope(dir: Directory): Promise<ScopeDeclarations> {
    const [context, entries, { internals }, { published }] = await Promise.all([
      config.resolve("structure.context"),
      listEnvironmentEntries(config),
      config.resolve("structure.options"),
      config.resolve("traits"),
    ]);

    if (dir !== rootScope) {
      return freeze({ internals, namespaces: freeze([]) });
    }

    const { namespaces } = await context.discover();

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
            return readNamespaceDeclarations(config, entry.name, published);
          }),
        ),
      ),
    });
  }

  return { root, scope };
}
