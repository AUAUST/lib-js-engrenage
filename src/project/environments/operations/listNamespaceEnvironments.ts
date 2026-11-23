import { entries, freeze } from "@auaust/toolkit/object";

import { getEnvironmentCoverage } from "#batiment/environments/index";
import type { NamespaceKind } from "#batiment/scopes/index";
import type { ConfigResolver } from "#project/config/index";

/**
 * Lists the environments placed on the active root top-level namespaces whose
 * kind `accepts` takes, each directory's covering one and those nested below it.
 */
export async function listNamespaceEnvironments(
  config: ConfigResolver,
  accepts: (kind: NamespaceKind) => boolean,
): Promise<readonly string[]> {
  const context = await config.resolve("structure.context");

  const { namespaces, environments } = await context.discover();

  const names = new Set<string>();

  for (const [, { active, kind, dirs }] of entries(namespaces)) {
    if (!active || !accepts(kind)) {
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
