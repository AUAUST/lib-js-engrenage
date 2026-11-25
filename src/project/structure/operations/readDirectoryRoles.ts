import { getOwn } from "@auaust/toolkit/object";

import { readScopeNamespaces } from "#project/environments/index";
import { readEnvironmentRoles } from "#project/structure/operations/readEnvironmentRoles";
import { listDirectoryEnvironments } from "#project/structure/utils/listDirectoryEnvironments";
import type { NamespaceRoles } from "#batiment/roles/index";
import type { ConfigResolver } from "#project/config/index";
import type { Directory } from "#types/Directory";

const projectRoot = ".";

/**
 * Reads the roles of each directory of the `namespace` environment, their
 * default role presets those of the languages the environments covering
 * that directory select.
 *
 * @returns No entry when the environment's structure is disabled.
 */
export async function readDirectoryRoles(
  config: ConfigResolver,
  namespace: string,
): Promise<ReadonlyMap<Directory, NamespaceRoles>> {
  const [namespaces, context] = await Promise.all([
    readScopeNamespaces(config),
    config.resolve("structure.context"),
  ]);

  const { environments } = await context.discover();

  const directories = (getOwn(namespaces, namespace)?.dirs ?? []).filter(
    (directory) => directory !== projectRoot,
  );

  const covered = listDirectoryEnvironments(
    environments.placements,
    directories,
  );

  const read = await Promise.all(
    [...covered].map(async ([directory, names]) => {
      const roles = await readEnvironmentRoles(config, namespace, names);

      return roles === undefined ? [] : [[directory, roles] as const];
    }),
  );

  return new Map(read.flat());
}
