import { map } from "@auaust/toolkit/array";

import type { LoadedConfig } from "#project/config/types/LoadedConfig";

export async function validateConfig(
  config: LoadedConfig,
): Promise<LoadedConfig> {
  await config.validate(
    map(config.context.registry.list("keys"), ({ key }) => key),
  );

  return config;
}
