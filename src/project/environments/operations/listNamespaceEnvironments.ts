import { entries, freeze } from "@auaust/toolkit/object";

import { getEnvironmentCoverage } from "#batiment/environments/index";
import { readScopeNamespaces } from "#project/environments/operations/readScopeNamespaces";
import type { NamespaceKind } from "#batiment/scopes/index";
import type { ConfigResolver } from "#project/config/index";

/**
 * Lists the environments placed on the active top-level namespaces of the scope
 * `config` resolves that `accepts` takes by kind and name, each directory's
 * covering one and those nested below it.
 */
export async function listNamespaceEnvironments(
  config: ConfigResolver,
  accepts: (kind: NamespaceKind, name: string) => boolean,
): Promise<readonly string[]> {
  const context = await config.resolve("structure.context");

  const [
    { environments },
    namespaces,
  ] = await Promise.all([context.discover(), readScopeNamespaces(config)]);

  const names = new Set<string>();

  for (const [name, { active, kind, dirs }] of entries(namespaces)) {
    if (!active || !accepts(kind, name)) {
      continue;
    }

    for (const dir of dirs) {
      const {
        environment,
        nested,
      } = getEnvironmentCoverage(environments.placements, dir);

      if (environment !== undefined) {
        names.add(environment);
      }

      for (const placement of nested) {
        names.add(placement.environment);
      }
    }
  }

  return freeze([...names]);
}
