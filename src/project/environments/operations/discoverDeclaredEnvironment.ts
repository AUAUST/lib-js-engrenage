import { getOwn } from "@auaust/toolkit/object";

import type { EnvironmentDiscovery } from "#batiment/context/index";
import type { ConfigResolver } from "#project/config/index";

/**
 * Reads the directories, root files and activity discovery gives the environment
 * from the `dirs` and `files` of its `<name>.options` key.
 */
export async function discoverDeclaredEnvironment(
  config: ConfigResolver,
  name: string,
): Promise<EnvironmentDiscovery> {
  const context = await config.resolve("structure.context");

  const { environments } = await context.discover();

  const discovered = getOwn(environments, name);

  if (discovered === undefined) {
    throw new Error(
      `Discovery placed no ${name} environment: no active extension contributes it`,
    );
  }

  return discovered;
}
