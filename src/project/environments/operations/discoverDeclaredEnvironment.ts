import { getOwn } from "@auaust/toolkit/object";

import { readScopeNamespaces } from "#project/environments/operations/readScopeNamespaces";
import type { NamespaceDiscovery } from "#batiment/context/index";
import type { ConfigResolver } from "#project/config/index";

/**
 * Reads the directories, root files and activity discovery gives the environment
 * in the scope `config` resolves, from the `dirs` and `files` of its
 * `<name>.options` key in that scope.
 */
export async function discoverDeclaredEnvironment(
  config: ConfigResolver,
  name: string,
): Promise<NamespaceDiscovery> {
  const namespaces = await readScopeNamespaces(config);

  const discovered = getOwn(namespaces, name);

  if (discovered === undefined) {
    throw new Error(
      `Discovery placed no ${name} environment: no active extension contributes it`,
    );
  }

  return discovered;
}
