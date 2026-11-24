import { flatMap, map } from "@auaust/toolkit/array";
import { freeze, keys, record } from "@auaust/toolkit/object";

import { discoverNamespace } from "#batiment/context/operations/discoverNamespace";
import { discoverNamespaceMetafiles } from "#batiment/context/operations/discoverNamespaceMetafiles";
import { discoverWorkspaces } from "#batiment/context/operations/discoverWorkspaces";
import { hasUnignoredFile } from "#batiment/context/operations/hasUnignoredFile";
import { resolveNamespaceImports } from "#batiment/context/operations/resolveNamespaceImports";
import {
  discoverEnvironmentPlacements,
  listEnvironmentInstances,
  listForeignPlacementGlobs,
  resolveRegisteredEnvironments,
  type DiscoveredEnvironment,
  type EnvironmentPreset,
} from "#batiment/environments/index";
import { rootScope } from "#batiment/scopes/constants";
import {
  createScopeTree,
  getNamespaceId,
  resolveNamespaceKind,
  type DiscoveredWorkspace,
  type NamespaceKind,
} from "#batiment/scopes/index";
import { findDirectories, type Filesystem } from "#foundation/filesystem/index";
import type { ContextPort } from "#batiment/context/ports/ContextPort";
import type { ContextDiscovery } from "#batiment/context/types/ContextDiscovery";
import type { EnvironmentDiscovery } from "#batiment/context/types/EnvironmentDiscovery";
import type { ExpectedWorkspaces } from "#batiment/context/types/ExpectedWorkspaces";
import type { NamespacePlacement } from "#batiment/context/types/NamespacePlacement";
import type { RootFacts } from "#batiment/context/types/RootFacts";
import type { ScopeRegistry } from "#batiment/context/types/ScopeRegistry";
import type { StructureDiagnostic } from "#batiment/report/index";
import type { Directory } from "#types/Directory";
import type { Glob } from "#types/Glob";
import type { Globs } from "#types/Globs";

interface DiscoveredScope {
  readonly dir: Directory;
  readonly registry: ScopeRegistry;
}

async function matchWorkspaces(
  filesystem: Filesystem,
  { workspaces }: RootFacts,
  discovered: readonly DiscoveredWorkspace[],
): Promise<readonly ExpectedWorkspaces[]> {
  const dirs = new Set(map(discovered, ({ dir }) => dir));

  const listed = await Promise.all(
    workspaces.map(async ({ glob }) => {
      return {
        glob,
        matched: await findDirectories(filesystem, await filesystem.glob(glob)),
      };
    }),
  );

  const claimed = new Map<Directory, Glob>();

  return freeze(
    listed.map(({ glob, matched }) => {
      for (const dir of matched) {
        const other = claimed.get(dir);

        if (other !== undefined) {
          throw new Error(
            `The workspace ${dir} is matched by both workspaces.${other} and workspaces.${glob}: give each workspace one glob`,
          );
        }

        claimed.set(dir, glob);
      }

      return freeze({
        glob,
        dirs: freeze(matched.filter((dir) => dirs.has(dir))),
        missing: freeze(matched.filter((dir) => !dirs.has(dir))),
      });
    }),
  );
}

function resolveConfiguredKind(
  kinds: ReadonlyMap<string, NamespaceKind>,
  { name, kind }: NamespacePlacement,
): NamespaceKind {
  const resolved = kinds.get(kind.value);

  if (resolved === undefined) {
    throw new Error(
      `The top-level namespace ${name} names the namespace kind "${kind.value}" in ${kind.config.path}, which no active extension contributes`,
    );
  }

  return resolved;
}

async function discoverEnvironments({
  presets,
  ignored,
  scopes,
  metafiles,
  filesystem,
}: {
  presets: readonly EnvironmentPreset[];
  ignored: Globs;
  scopes: readonly DiscoveredScope[];
  metafiles: readonly DiscoveredEnvironment[];
  filesystem: Filesystem;
}): Promise<{
  readonly discovery: EnvironmentDiscovery;
  readonly diagnostics: readonly StructureDiagnostic[];
}> {
  const registered = flatMap(scopes, ({ dir, registry }) => {
    return resolveRegisteredEnvironments(presets, registry.environments, dir);
  });

  const { placements, diagnostics } = await discoverEnvironmentPlacements({
    registered,
    metafiles,
    ignored,
    filesystem,
  });

  const placed = await Promise.all(
    keys(placements.dirs).map(async (dir) => {
      const active = await hasUnignoredFile({
        filesystem,
        ignored: [...ignored, ...listForeignPlacementGlobs(placements, dir)],
        dirs: [dir],
        files: [],
      });

      return active ? [dir] : [];
    }),
  );

  const instances = listEnvironmentInstances(
    registered,
    placements,
    scopes.map(({ dir }) => dir).filter((dir) => dir !== rootScope),
    new Set(placed.flat()),
  );

  return {
    discovery: freeze({
      registered: freeze(registered),
      placements,
      instances,
    }),
    diagnostics,
  };
}

async function placeNamespaces({
  scope: { dir, registry },
  kinds,
  ignored,
  filesystem,
}: {
  scope: DiscoveredScope;
  kinds: ReadonlyMap<string, NamespaceKind>;
  ignored: Globs;
  filesystem: Filesystem;
}) {
  return Promise.all(
    registry.namespaces.map(async (placement) => {
      const { name, dirs, files } = placement;

      const discovery = await discoverNamespace({
        scope: dir,
        name,
        dirs,
        files,
        claims: registry.claims,
        ignored,
        filesystem,
      });

      return {
        placement,
        configured: resolveConfiguredKind(kinds, placement),
        discovery,
      };
    }),
  );
}

/**
 * Discovers the scopes and their top-level namespaces and environments: the
 * root's from `port.root()`, each workspace's from `port.registry()`, asked once
 * the workspace is found and matched.
 */
export async function discoverContext(
  port: ContextPort,
  filesystem: Filesystem,
): Promise<ContextDiscovery> {
  const root = await port.root();

  const { ignored } = root;

  const kinds = new Map(root.kinds.map((kind) => [kind.name, kind]));

  const discovered = await discoverWorkspaces({ filesystem, ignored });

  const expected = await matchWorkspaces(
    filesystem,
    root,
    discovered.workspaces,
  );

  const workspaces = await Promise.all(
    discovered.workspaces.map(async (workspace) => {
      const glob = expected.find(({ dirs }) => {
        return dirs.includes(workspace.dir);
      })?.glob;

      const registry = await port.registry(
        freeze({ ...workspace, ...(glob === undefined ? {} : { glob }) }),
      );

      return {
        workspace,
        glob,
        registry,
      };
    }),
  );

  const scopes: readonly DiscoveredScope[] = [
    { dir: rootScope, registry: root },
    ...map(workspaces, ({ workspace: { dir }, registry }) => {
      return { dir, registry };
    }),
  ];

  const placed = await Promise.all(
    scopes.map(async (scope) => {
      return {
        dir: scope.dir,
        namespaces: await placeNamespaces({
          scope,
          kinds,
          ignored,
          filesystem,
        }),
      };
    }),
  );

  const namespaceMetafiles = await discoverNamespaceMetafiles({
    filesystem,
    ignored,
    dirs: flatMap(placed, ({ namespaces }) => {
      return flatMap(namespaces, ({ discovery }) => discovery.dirs);
    }),
  });

  const environments = await discoverEnvironments({
    presets: root.presets,
    ignored,
    scopes,
    metafiles: discovered.environments,
    filesystem,
  });

  const diagnostics: StructureDiagnostic[] = [
    ...discovered.diagnostics,
    ...namespaceMetafiles.diagnostics,
    ...environments.diagnostics,
  ];

  const resolved = placed.map(({ dir, namespaces }) => {
    return {
      dir,
      namespaces: namespaces.map(({ placement, configured, discovery }) => {
        const metafiles = namespaceMetafiles.namespaces.filter((metafile) => {
          return discovery.dirs.includes(metafile.dir);
        });

        const kind = resolveNamespaceKind({
          dir: discovery.dirs[0] ?? getNamespaceId(dir, placement.name),
          kinds,
          metafiles,
          diagnostics,
          declared: { kind: configured, config: placement.kind.config },
        });

        return {
          placement,
          discovery: freeze({ ...discovery, kind }),
          metafiles,
        };
      }),
    };
  });

  const active = resolved.map(({ namespaces }) => {
    const scope = map(namespaces, ({ placement, discovery }) => {
      return { name: placement.name, kind: discovery.kind };
    });

    return namespaces
      .filter(({ discovery }) => discovery.active)
      .map(({ placement, discovery, metafiles }) => {
        return {
          placement,
          namespace: {
            name: placement.name,
            kind: discovery.kind,
            dirs: discovery.dirs,
            ...resolveNamespaceImports({
              metafiles,
              scope,
              diagnostics,
            }),
          },
        };
      });
  });

  const [rootNamespaces = [], ...workspaceNamespaces] = active;

  const tree = createScopeTree({
    namespaces: map(rootNamespaces, ({ placement, namespace }) => {
      return { ...namespace, title: placement.title };
    }),
    workspaces: workspaces.map(
      ({ workspace: { dir, file, purpose }, glob }, index) => {
        const declared = root.workspaces.find((workspace) => {
          return workspace.glob === glob;
        })?.purpose;

        return {
          dir,
          namespaces: map(
            workspaceNamespaces[index] ?? [],
            ({ namespace }) => namespace,
          ),
          ...(purpose === undefined
            ? {}
            : {
                purpose: { value: purpose, file },
              }),
          ...(declared === undefined ? {} : { declared }),
        };
      },
    ),
    missing: flatMap(expected, ({ glob, missing }) => {
      return map(missing, (dir) => {
        return { dir, glob };
      });
    }),
  });

  return freeze({
    workspaces: discovered.workspaces,
    namespaces: freeze(
      record(
        resolved.map(({ dir, namespaces }) => {
          return [
            dir,
            freeze(
              record(
                namespaces.map(({ placement, discovery }) => {
                  return [placement.name, discovery] as const;
                }),
              ),
            ),
          ] as const;
        }),
      ),
    ),
    environments: environments.discovery,
    expected,
    tree: freeze({
      ...tree,
      diagnostics: freeze([...diagnostics, ...tree.diagnostics]),
    }),
    diagnostics: freeze(diagnostics),
    ignored,
  });
}
