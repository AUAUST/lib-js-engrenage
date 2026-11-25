import { map, toDeduplicated } from "@auaust/toolkit/array";
import { getOwn, keys } from "@auaust/toolkit/object";

import {
  getEnvironmentCoverage,
  type EnvironmentPlacements,
} from "#batiment/environments/index";
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
import type { ConfigResolver } from "#project/config/index";
import type { Directory } from "#types/Directory";

function isWithin(path: Directory, dir: Directory): boolean {
  return path === dir || path.startsWith(`${dir}/`);
}

// @debt maps placements to the namespace directory holding them here, beside listNamespaceEnvironments' own walk over the same coverage, instead of one environments helper both read
/**
 * Lists, by directory of `structure`, the environments covering it: the one
 * placed at or above it, and those placed below it outside a nested directory
 * of the namespace.
 */
function listDirectoryEnvironments(
  placements: EnvironmentPlacements,
  structure: NamespaceStructure,
): ReadonlyMap<Directory, readonly string[]> {
  const directories = map(
    listNamespaceDirectories(structure),
    ({ directory }) => directory,
  );

  return new Map(
    map(directories, (directory) => {
      const {
        environment,
        nested,
      } = getEnvironmentCoverage(placements, directory);

      const inner = directories.filter((other) => {
        return other !== directory && isWithin(other, directory);
      });

      const own = nested.filter(({ dir }) => {
        return !inner.some((other) => isWithin(dir, other));
      });

      return [
        directory,
        toDeduplicated([
          ...(environment === undefined ? [] : [environment]),
          ...map(own, (placement) => placement.environment),
        ]),
      ] as const;
    }),
  );
}

/**
 * Lists the environments of `structure` whose modules the code of `environment`
 * may import: those of each directory the directories it covers may import.
 */
function listReachableDirectoryEnvironments(
  placements: EnvironmentPlacements,
  structure: NamespaceStructure,
  environment: string,
): readonly string[] {
  const covered = listDirectoryEnvironments(placements, structure);

  const reachable = [...covered]
    .filter(([, environments]) => environments.includes(environment))
    .flatMap(([directory]) => listImportableDirectories(structure, directory));

  return toDeduplicated(
    reachable.flatMap((directory) => {
      return covered.get(directory) ?? [];
    }),
  );
}

/**
 * Lists the environments of the scope `config` resolves whose modules the code
 * of `environment` may import: itself, the environments of the directories
 * of its namespaces its own may import, and those of the namespaces its
 * namespaces' grants reach.
 */
export async function listImportableEnvironments(
  config: ConfigResolver,
  environment: string,
): Promise<readonly string[]> {
  const [
    { namespaces: forbidden, entries },
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

    return structure === undefined
      ? (placed.get(namespace) ?? [])
      : listReachableDirectoryEnvironments(
          environments.placements,
          structure,
          environment,
        );
  }

  // @debt reads grants per namespace within one scope: per-variant file grants and workspace dependencies on other scopes are ignored, so a workspace reaching another scope's modules (Interscript's extensions/* importing admin) gets none of their environments
  const reached = names.flatMap((target) => {
    if (importers.includes(target)) {
      return listOwnEnvironments(target);
    }

    return importers.some((importer) => isGranted(importer, target))
      ? (placed.get(target) ?? [])
      : [];
  });

  return toDeduplicated([environment, ...reached]);
}
