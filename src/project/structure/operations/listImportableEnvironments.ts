import { map, toDeduplicated } from "@auaust/toolkit/array";
import { getOwn, keys } from "@auaust/toolkit/object";

import { getNamespaceId } from "#batiment/scopes/index";
import {
  getNamespaceCategory,
  listImportableDirectories,
  listNamespaceDirectories,
  type NamespaceStructure,
} from "#batiment/structure/index";
import {
  listNamespaceEnvironments,
  readScopeNamespaces,
} from "#project/environments/index";
import { listDirectoryEnvironments } from "#project/structure/utils/listDirectoryEnvironments";
import type { EnvironmentPlacements } from "#batiment/environments/index";
import type { ConfigResolver } from "#project/config/index";
import type { Directories } from "#types/Directories";
import type { Directory } from "#types/Directory";

function listNamespaceDirectoryPaths(
  structure: NamespaceStructure,
): readonly Directory[] {
  return map(listNamespaceDirectories(structure), ({ directory }) => directory);
}

/**
 * Lists the environments of `structure` whose modules the code of `from` may
 * import: those of each directory the directories of `from` may import.
 */
function listReachableDirectoryEnvironments(
  placements: EnvironmentPlacements,
  structure: NamespaceStructure,
  from: Directories,
): readonly string[] {
  const covered = listDirectoryEnvironments(
    placements,
    listNamespaceDirectoryPaths(structure),
  );

  const reachable = toDeduplicated(
    from.flatMap((directory) => {
      return listImportableDirectories(structure, directory);
    }),
  );

  return toDeduplicated(
    reachable.flatMap((directory) => {
      return covered.get(directory) ?? [];
    }),
  );
}

/**
 * Lists the environments of the scope `config` resolves whose modules the code
 * of `environment` may import: itself, the environments of the directories of
 * its namespaces its own may import, and those of the directories of other
 * namespaces its namespaces' grants reach, with the directories those import.
 */
export async function listImportableEnvironments(
  config: ConfigResolver,
  environment: string,
): Promise<readonly string[]> {
  const [
    { namespaces: forbidden, directories, entries },
    namespaces,
    structures,
    context,
  ] = await Promise.all([
    config.resolve("importGrants"),
    readScopeNamespaces(config),
    config.resolve("structure"),
    config.resolve("structure.context"),
  ]);

  const { environments } = await context.discover();

  const { scopeDir } = config.context;

  const names = keys(namespaces);

  const placed = new Map(
    await Promise.all(
      map(names, async (namespace) => {
        const placements = await listNamespaceEnvironments(
          config,
          (_kind, name) => name === namespace,
        );

        return [namespace, placements] as const;
      }),
    ),
  );

  const importers = names.filter((namespace) => {
    return placed.get(namespace)?.includes(environment) === true;
  });

  function isGranted(importer: string, target: string): boolean {
    const denied = forbidden[getNamespaceId(scopeDir, importer)];

    const category = getNamespaceCategory(
      getNamespaceId(scopeDir, target),
      entries,
    );

    return denied !== undefined && !denied.includes(category);
  }

  function listOwnEnvironments(namespace: string): readonly string[] {
    const structure = getOwn(structures, namespace);

    if (structure === undefined) {
      return placed.get(namespace) ?? [];
    }

    const covered = listDirectoryEnvironments(
      environments.placements,
      listNamespaceDirectoryPaths(structure),
    );

    const own = [...covered]
      .filter(([, placedOn]) => placedOn.includes(environment))
      .map(([directory]) => directory);

    return listReachableDirectoryEnvironments(
      environments.placements,
      structure,
      own,
    );
  }

  /**
   * Lists the environments of `target` its importers' grants reach: every one
   * placed on it, unless each granting importer reaches only some directories.
   */
  function listGrantedEnvironments(target: string): readonly string[] {
    const targetId = getNamespaceId(scopeDir, target);

    const reaches = importers
      .filter((importer) => isGranted(importer, target))
      .map((importer) => {
        return directories[getNamespaceId(scopeDir, importer)]?.[targetId];
      });

    if (reaches.length === 0) {
      return [];
    }

    if (reaches.includes(undefined)) {
      return placed.get(target) ?? [];
    }

    const reached = toDeduplicated(
      reaches.flatMap((dirs) => {
        return dirs ?? [];
      }),
    );

    const structure = getOwn(structures, target);

    return structure === undefined
      ? toDeduplicated(
          [
            ...listDirectoryEnvironments(
              environments.placements,
              reached,
            ).values(),
          ].flat(),
        )
      : listReachableDirectoryEnvironments(
          environments.placements,
          structure,
          reached,
        );
  }

  // @debt reads grants per namespace within one scope: per-variant file grants and workspace dependencies on other scopes are ignored, so a workspace reaching another scope's modules (Interscript's extensions/* importing admin) gets none of their environments
  const reached = names.flatMap((target) => {
    return importers.includes(target)
      ? listOwnEnvironments(target)
      : listGrantedEnvironments(target);
  });

  return toDeduplicated([environment, ...reached]);
}
