import { flatMap, map } from "@auaust/toolkit/array";
import { freeze, record } from "@auaust/toolkit/object";

import { discoverEnvironments } from "#batiment/context/operations/discoverEnvironments";
import { discoverNamespace } from "#batiment/context/operations/discoverNamespace";
import { discoverNamespaceMetafiles } from "#batiment/context/operations/discoverNamespaceMetafiles";
import { discoverWorkspaces } from "#batiment/context/operations/discoverWorkspaces";
import { resolveNamespaceImports } from "#batiment/context/operations/resolveNamespaceImports";
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
import type { DiscoveredScope } from "#batiment/context/types/DiscoveredScope";
import type { ExpectedWorkspaces } from "#batiment/context/types/ExpectedWorkspaces";
import type { NamespacePlacement } from "#batiment/context/types/NamespacePlacement";
import type { RootFacts } from "#batiment/context/types/RootFacts";
import type { StructureDiagnostic } from "#batiment/report/index";
import type { Directory } from "#types/Directory";
import type { Glob } from "#types/Glob";
import type { Globs } from "#types/Globs";

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
 * root's from `port.root()`, each workspace's from `port.registry()`, asked
 * once the workspace is found and matched. Under `extraWorkspaces` `report`, a
 * workspace no glob matches is a diagnostic instead.
 *
 * @throws When a scope places an environment on a directory inside a
 * nested workspace.
 */
export async function discoverContext(
  port: ContextPort,
  filesystem: Filesystem,
): Promise<ContextDiscovery> {
  const root = await port.root();

  const { ignored } = root;

  const discovered = await discoverWorkspaces({ filesystem, ignored });

  const expected = await matchWorkspaces(
    filesystem,
    root,
    discovered.workspaces,
  );

  const matched = map(discovered.workspaces, (workspace) => {
    const glob = expected.find(({ dirs }) => {
      return dirs.includes(workspace.dir);
    })?.glob;

    return { workspace, glob };
  });

  // @debt discoverWorkspaces still counts an unmatched workspace's directory as a scope root when it refuses `.environment.json` metafiles there, though under `report` the directory is no scope
  const unmatched = root.extraWorkspaces === "report"
    ? matched.filter(({ glob }) => glob === undefined)
    : [];

  const accepted = matched.filter((entry) => !unmatched.includes(entry));

  const workspaces = await Promise.all(
    accepted.map(async ({ workspace, glob }) => {
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
      const kinds = new Map(
        scope.registry.kinds.map((kind) => [kind.name, kind]),
      );

      return {
        dir: scope.dir,
        kinds,
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
    ignored,
    scopes,
    workspaces: map(accepted, ({ workspace }) => workspace),
    metafiles: discovered.environments,
    filesystem,
  });

  const diagnostics: StructureDiagnostic[] = [
    ...discovered.diagnostics,
    ...namespaceMetafiles.diagnostics,
    ...environments.diagnostics,
  ];

  const resolved = placed.map(({ dir, kinds, namespaces }) => {
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
    unmatched: map(unmatched, ({ workspace: { dir, file } }) => {
      return { dir, file };
    }),
  });

  return freeze({
    workspaces: freeze(map(workspaces, ({ workspace }) => workspace)),
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
