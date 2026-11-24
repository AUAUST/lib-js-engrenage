import { values } from "@auaust/toolkit/object";

import type { ConfigResolver, LoadedConfig } from "#project/config/index";

/**
 * The config of each scope of the project: the root config for `.`, else the
 * workspace's child resolver.
 */
export async function listScopeConfigs(
  config: ConfigResolver,
): Promise<readonly LoadedConfig[]> {
  const { scopes } = await config.resolve("scopes");

  return Promise.all(
    values(scopes).map(({ dir }) => {
      return config.context.scope(dir);
    }),
  );
}
