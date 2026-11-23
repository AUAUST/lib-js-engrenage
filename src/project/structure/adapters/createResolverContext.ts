import { array, is, looseObject, optional, string } from "valibot";

import { entries, freeze } from "@auaust/toolkit/object";

import { rootScope } from "#batiment/scopes/constants";
import {
  flattenStructure,
  listDeclaredOptionPaths,
  listKindConflictPaths,
} from "#batiment/structure/index";
import {
  getOptionsKey,
  listEnvironmentEntries,
  type ContributedEnvironmentEntry,
} from "#project/environments/index";
import { readEnvironmentRoles } from "#project/structure/operations/readEnvironmentRoles";
import { readStructureOption } from "#project/structure/operations/readStructureOption";
import type {
  ContextPort,
  EnvironmentDeclarations,
  NamespacePlacement,
  RootFacts,
  ScopeDeclarations,
  WorkspaceExpectation,
} from "#batiment/context/index";
import type { Resolver, ValueOrigin } from "#foundation/options/index";
import type { ConfigContext, ConfigResolver } from "#project/config/index";
import type { Directory } from "#types/Directory";

const placementOption = looseObject({
  kind: optional(string()),
  dirs: array(string()),
  files: optional(array(string())),
});

async function readPlacement(
  config: ConfigResolver,
  contributed: ContributedEnvironmentEntry,
): Promise<NamespacePlacement> {
  const key = getOptionsKey(contributed);

  const resolver: Resolver<ConfigContext> = config;

  const option = await resolver.resolve(key);

  if (!is(placementOption, option)) {
    throw new Error(
      `Config key "${key}" resolves to no environment options: it lacks a \`dirs\` list, or holds a \`kind\` that is not a string or a \`files\` that is not a list`,
    );
  }

  const { name, title } = contributed.entry;

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

async function readEnvironmentDeclarations(
  config: ConfigResolver,
  contributed: ContributedEnvironmentEntry,
  published: boolean,
): Promise<EnvironmentDeclarations> {
  const { name } = contributed.entry;
  const key = getOptionsKey(contributed);

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
    environment: name,
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
      languages,
      entries,
      claims,
      workspaces,
    ] = await Promise.all([
      config.resolve("git"),
      config.context.registry.contributions("namespaceKinds", config),
      config.context.registry.contributions("languages", config),
      listEnvironmentEntries(config),
      config.resolve("environments.claims"),
      readWorkspaceExpectations(config),
    ]);

    return freeze({
      ignored: await repository.ignored,
      kinds: freeze(kinds.map(({ entry }) => entry)),
      languages: freeze(languages.map(({ entry }) => entry.name)),
      namespaces: freeze(
        await Promise.all(
          entries.map((contributed) => readPlacement(config, contributed)),
        ),
      ),
      claims,
      workspaces: freeze(workspaces),
    });
  }

  async function scope(dir: Directory): Promise<ScopeDeclarations> {
    const [environments, { internals }, { published }] = await Promise.all([
      config.resolve("environments"),
      config.resolve("structure.options"),
      config.resolve("traits"),
    ]);

    if (dir !== rootScope) {
      return freeze({ internals, environments: freeze([]) });
    }

    return freeze({
      internals,
      environments: freeze(
        await Promise.all(
          environments
            .filter(({ namespace }) => namespace.structure !== undefined)
            .map((contributed) => {
              return readEnvironmentDeclarations(
                config,
                contributed,
                published,
              );
            }),
        ),
      ),
    });
  }

  return { root, scope };
}
