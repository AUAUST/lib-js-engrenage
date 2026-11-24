import { getOwn } from "@auaust/toolkit/object";

import type { NamespaceDiscovery } from "#batiment/context/index";
import type { ConfigResolver } from "#project/config/index";

/**
 * Reads the top-level namespaces discovery finds in the scope `config`
 * resolves, by name, each placement of the scope's registry included, inactive
 * when it holds no file.
 *
 * @throws When discovery found no scope at the directory `config` resolves.
 */
export async function readScopeNamespaces(
  config: ConfigResolver,
): Promise<Readonly<Record<string, NamespaceDiscovery>>> {
  const context = await config.resolve("structure.context");

  const { namespaces } = await context.discover();

  const { scopeDir } = config.context;

  const scope = getOwn(namespaces, scopeDir);

  if (scope === undefined) {
    throw new Error(`Discovery found no workspace at ${scopeDir}`);
  }

  return scope;
}
