import { Minimatch } from "minimatch";

import { flatMap, map } from "@auaust/toolkit/array";
import { freeze, keys } from "@auaust/toolkit/object";

import { hasUnignoredFile } from "#batiment/context/operations/hasUnignoredFile";
import {
  discoverEnvironmentPlacements,
  listEnvironmentInstances,
  listForeignPlacementGlobs,
  resolveRegisteredEnvironments,
  type DiscoveredEnvironment,
  type EnvironmentPreset,
  type RegisteredEnvironment,
} from "#batiment/environments/index";
import { rootScope } from "#batiment/scopes/constants";
import {
  createScopeFinder,
  type DiscoveredWorkspace,
} from "#batiment/scopes/index";
import type { DiscoveredScope } from "#batiment/context/types/DiscoveredScope";
import type { EnvironmentDiscovery } from "#batiment/context/types/EnvironmentDiscovery";
import type { StructureDiagnostic } from "#batiment/report/index";
import type { Filesystem } from "#foundation/filesystem/index";
import type { Globs } from "#types/Globs";

function assertOwnPlacements(
  registered: readonly RegisteredEnvironment[],
  workspaces: readonly DiscoveredWorkspace[],
): void {
  const findScope = createScopeFinder(map(workspaces, ({ dir }) => dir));

  for (const { scope, registration, dirs } of registered) {
    for (const dir of dirs) {
      if (new Minimatch(dir).hasMagic()) {
        continue;
      }

      const nested = workspaces.find((workspace) => {
        return workspace.dir === findScope(dir) && workspace.dir !== scope;
      });

      if (nested !== undefined) {
        throw new Error(
          `The environment ${registration.name} of ${scope === rootScope ? "the root" : `the workspace ${scope}`} is placed on ${dir} by ${registration.dirsSource?.path ?? "its dirs"}, inside the workspace ${nested.dir}: register it in ${nested.file}`,
        );
      }
    }
  }
}

/**
 * Discovers the environments every scope registers: their placements, each scope's
 * kept within it, a `dirs` glob skipping its matches inside nested workspaces,
 * and the instances they form.
 *
 * @throws When a scope places an environment on a directory inside a
 * nested workspace.
 */
export async function discoverEnvironments({
  presets,
  ignored,
  scopes,
  workspaces,
  metafiles,
  filesystem,
}: {
  presets: readonly EnvironmentPreset[];
  ignored: Globs;
  scopes: readonly DiscoveredScope[];
  workspaces: readonly DiscoveredWorkspace[];
  metafiles: readonly DiscoveredEnvironment[];
  filesystem: Filesystem;
}): Promise<{
  readonly discovery: EnvironmentDiscovery;
  readonly diagnostics: readonly StructureDiagnostic[];
}> {
  const registered = flatMap(scopes, ({ dir, registry }) => {
    return resolveRegisteredEnvironments(presets, registry.environments, dir);
  });

  assertOwnPlacements(registered, workspaces);

  const { placements, diagnostics } = await discoverEnvironmentPlacements({
    registered,
    scopes: map(workspaces, ({ dir }) => dir),
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
