import { posix } from "node:path";

import { flatMap, map } from "@auaust/toolkit/array";
import { freeze, record } from "@auaust/toolkit/object";

import { discoverEnvironment } from "#batiment/context/operations/discoverEnvironment";
import { discoverWorkspaces } from "#batiment/context/operations/discoverWorkspaces";
import {
  createScopeTree,
  getEnvironmentId,
  type DiscoveredEnvironment,
  type DiscoveredWorkspace,
} from "#batiment/scopes/index";
import { findDirectories, type Filesystem } from "#foundation/filesystem/index";
import type { ContextPort } from "#batiment/context/ports/ContextPort";
import type { ContextDiscovery } from "#batiment/context/types/ContextDiscovery";
import type { ExpectedWorkspaces } from "#batiment/context/types/ExpectedWorkspaces";
import type { RootFacts } from "#batiment/context/types/RootFacts";
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

async function listWorkspaceEnvironments({
  dir,
  metafiles,
  ignored,
  filesystem,
}: {
  dir: Directory;
  metafiles: readonly DiscoveredEnvironment[];
  ignored: Globs;
  filesystem: Filesystem;
}) {
  // @debt a workspace's environments are only its `.environment.json` dirs, with no defaults or multi-dir environments, until its child resolver declares them (#745)
  const found = await Promise.all(
    metafiles
      .filter((environment) => posix.dirname(environment.dir) === dir)
      .map(async ({ dir: environmentDir, kind }) => {
        const name = posix.basename(environmentDir);
        const dirs = [environmentDir];

        const { active } = await discoverEnvironment({
          name: getEnvironmentId(dir, name),
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

export async function discoverContext(
  port: ContextPort,
  filesystem: Filesystem,
): Promise<ContextDiscovery> {
  const root = await port.root();

  const { ignored, claims } = root;

  const discovered = await discoverWorkspaces({
    filesystem,
    ignored,
    kinds: root.kinds,
    languages: root.languages,
  });

  const [placed, expected] = await Promise.all([
    Promise.all(
      root.environments.map(async ({ name, kind, dirs, files }) => {
        const discovery = await discoverEnvironment({
          name,
          dirs,
          files,
          claims,
          ignored,
          filesystem,
        });

        return {
          name,
          kind,
          discovery,
        };
      }),
    ),
    matchWorkspaces(filesystem, root, discovered.workspaces),
  ]);

  const workspaces = await Promise.all(
    discovered.workspaces.map(async ({ dir, file, purpose }) => {
      const glob = expected.find(({ dirs }) => dirs.includes(dir))?.glob;

      const declared = root.workspaces.find((workspace) => {
        return workspace.glob === glob;
      })?.purpose;

      const environments = await listWorkspaceEnvironments({
        dir,
        metafiles: discovered.environments,
        ignored,
        filesystem,
      });

      return {
        dir,
        environments,
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
    environments: placed
      .filter(({ discovery }) => discovery.active)
      .map(({ name, kind, discovery }) => {
        return {
          name,
          kind,
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
    environments: freeze(
      record(placed.map(({ name, discovery }) => [name, discovery] as const)),
    ),
    expected,
    tree: freeze({
      ...tree,
      diagnostics: freeze([...discovered.diagnostics, ...tree.diagnostics]),
    }),
    diagnostics: discovered.diagnostics,
    ignored,
  });
}
