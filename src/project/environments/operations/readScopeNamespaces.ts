import { freeze, getOwn, mapValues, record } from "@auaust/toolkit/object";

import { rootScope } from "#batiment/scopes/constants";
import type { NamespaceDiscovery } from "#batiment/context/index";
import type { ConfigResolver } from "#project/config/index";

const noPaths = freeze([]);

/**
 * Reads the top-level namespaces discovery finds in the scope `config` resolves,
 * by name: the root's placements, or a workspace's namespaces, each root placement
 * it lacks inactive with the root's kind.
 */
export async function readScopeNamespaces(
  config: ConfigResolver,
): Promise<Readonly<Record<string, NamespaceDiscovery>>> {
  const context = await config.resolve("structure.context");

  const { namespaces, tree } = await context.discover();

  const { scopeDir } = config.context;

  if (scopeDir === rootScope) {
    return namespaces;
  }

  const scope = getOwn(tree.scopes, scopeDir);

  if (scope === undefined) {
    throw new Error(`Discovery found no workspace at ${scopeDir}`);
  }

  return freeze({
    ...mapValues(namespaces, ({ kind }): NamespaceDiscovery => {
      return freeze({
        dirs: noPaths,
        rootFiles: noPaths,
        active: false,
        kind,
      });
    }),
    ...record(
      scope.namespaces.map(({ name, kind, dirs }) => {
        return [
          name,
          freeze({
            dirs,
            rootFiles: noPaths,
            active: true,
            kind,
          }),
        ] as const;
      }),
    ),
  });
}
