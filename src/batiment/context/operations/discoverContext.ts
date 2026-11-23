import { posix } from "node:path";

import { flatMap, map } from "@auaust/toolkit/array";
import { freeze, record } from "@auaust/toolkit/object";

import { discoverNamespace } from "#batiment/context/operations/discoverNamespace";
import { discoverWorkspaces } from "#batiment/context/operations/discoverWorkspaces";
import {
  createScopeTree,
  getNamespaceId,
  resolveNamespaceKind,
  type DiscoveredNamespace,
  type DiscoveredWorkspace,
  type NamespaceKind,
} from "#batiment/scopes/index";
import { findDirectories, type Filesystem } from "#foundation/filesystem/index";
import type { ContextPort } from "#batiment/context/ports/ContextPort";
import type { ContextDiscovery } from "#batiment/context/types/ContextDiscovery";
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

async function listWorkspaceNamespaces({
  dir,
  metafiles,
  kinds,
  diagnostics,
  ignored,
  filesystem,
}: {
  dir: Directory;
  metafiles: readonly DiscoveredNamespace[];
  kinds: ReadonlyMap<string, NamespaceKind>;
  diagnostics: StructureDiagnostic[];
  ignored: Globs;
  filesystem: Filesystem;
}) {
  // @debt a workspace's top-level namespaces are only its `.namespace.json` dirs, with no defaults or multi-dir namespaces, until its child resolver declares them (#745)
  const found = await Promise.all(
    metafiles
      .filter((metafile) => posix.dirname(metafile.dir) === dir)
      .map(async (metafile) => {
        const name = posix.basename(metafile.dir);
        const dirs = [metafile.dir];

        const kind = resolveNamespaceKind({
          dir: metafile.dir,
          kinds,
          metafiles: [metafile],
          diagnostics,
        });

        const { active } = await discoverNamespace({
          name: getNamespaceId(dir, name),
          dirs,
          files: [],
          claims: {},
          ignored,
          filesystem,
        });

        return kind === undefined || !active
          ? []
          : [
              {
                name,
                kind,
                dirs,
              },
            ];
      }),
  );

  return found.flat();
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

export async function discoverContext(
  port: ContextPort,
  filesystem: Filesystem,
): Promise<ContextDiscovery> {
  const root = await port.root();

  const { ignored, claims } = root;

  const kinds = new Map(root.kinds.map((kind) => [kind.name, kind]));

  const placed = await Promise.all(
    root.namespaces.map(async (placement) => {
      const { name, dirs, files } = placement;

      const discovery = await discoverNamespace({
        name,
        dirs,
        files,
        claims,
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

  const discovered = await discoverWorkspaces({
    filesystem,
    ignored,
    dirs: flatMap(placed, ({ discovery }) => discovery.dirs),
    languages: root.languages,
  });

  const expected = await matchWorkspaces(
    filesystem,
    root,
    discovered.workspaces,
  );

  const diagnostics: StructureDiagnostic[] = [...discovered.diagnostics];

  const resolved = placed.map(({ placement, configured, discovery }) => {
    const kind = resolveNamespaceKind({
      dir: discovery.dirs[0] ?? placement.name,
      kinds,
      metafiles: discovered.namespaces.filter(({ dir }) => {
        return discovery.dirs.includes(dir);
      }),
      diagnostics,
      declared: { kind: configured, config: placement.kind.config },
    });

    return {
      placement,
      discovery: freeze({ ...discovery, kind }),
    };
  });

  const workspaces = await Promise.all(
    discovered.workspaces.map(async ({ dir, file, purpose }) => {
      const glob = expected.find(({ dirs }) => dirs.includes(dir))?.glob;

      const declared = root.workspaces.find((workspace) => {
        return workspace.glob === glob;
      })?.purpose;

      const namespaces = await listWorkspaceNamespaces({
        dir,
        metafiles: discovered.namespaces,
        kinds,
        diagnostics,
        ignored,
        filesystem,
      });

      return {
        dir,
        namespaces,
        ...(purpose === undefined
          ? {}
          : {
              purpose: { value: purpose, file },
            }),
        ...(declared === undefined ? {} : { declared }),
      };
    }),
  );

  const tree = createScopeTree({
    namespaces: resolved
      .filter(({ discovery }) => discovery.active)
      .map(({ placement, discovery }) => {
        return {
          name: placement.name,
          title: placement.title,
          kind: discovery.kind,
          dirs: discovery.dirs,
        };
      }),
    workspaces,
    missing: flatMap(expected, ({ glob, missing }) => {
      return map(missing, (dir) => {
        return { dir, glob };
      });
    }),
  });

  return freeze({
    workspaces: discovered.workspaces,
    metafiles: discovered.environments,
    namespaces: freeze(
      record(
        resolved.map(({ placement, discovery }) => {
          return [placement.name, discovery] as const;
        }),
      ),
    ),
    expected,
    tree: freeze({
      ...tree,
      diagnostics: freeze([...diagnostics, ...tree.diagnostics]),
    }),
    diagnostics: freeze(diagnostics),
    ignored,
  });
}
