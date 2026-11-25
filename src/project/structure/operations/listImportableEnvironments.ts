import { map, toDeduplicated } from "@auaust/toolkit/array";
import { keys } from "@auaust/toolkit/object";

import { getNamespaceId } from "#batiment/scopes/index";
import { getNamespaceCategory } from "#batiment/structure/index";
import {
  listNamespaceEnvironments,
  readScopeNamespaces,
} from "#project/environments/index";
import type { ConfigResolver } from "#project/config/index";

/**
 * Lists the environments of the scope `config` resolves whose modules the code
 * of `environment` may import: itself, the other environments of its namespaces,
 * and those of the namespaces its namespaces' grants reach.
 */
export async function listImportableEnvironments(
  config: ConfigResolver,
  environment: string,
): Promise<readonly string[]> {
  const [{ namespaces: forbidden, entries }, namespaces] = await Promise.all([
    config.resolve("importGrants"),
    readScopeNamespaces(config),
  ]);

  const { scopeDir } = config.context;

  const names = keys(namespaces);

  const placed = new Map(
    await Promise.all(
      map(names, async (namespace) => {
        const environments = await listNamespaceEnvironments(
          config,
          (_kind, name) => name === namespace,
        );

        return [namespace, environments] as const;
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

  // @debt reads grants per namespace within one scope: per-variant file grants and workspace dependencies on other scopes are ignored, so a workspace reaching another scope's modules (Interscript's extensions/* importing admin) gets none of their environments
  const reached = names.filter((target) => {
    return importers.some((importer) => {
      return importer === target || isGranted(importer, target);
    });
  });

  return toDeduplicated([
    environment,
    ...reached.flatMap((namespace) => {
      return placed.get(namespace) ?? [];
    }),
  ]);
}
