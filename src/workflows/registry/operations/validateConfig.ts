import { validate } from "#foundation/options/index";
import { configSchema } from "#workflows/registry/config/schemas/configSchema";
import type { LoadedConfig } from "#project/config/index";

// @debt validation runs apart from loading, so every caller must remember to validate and definers read an unvalidated config
export function validateConfig(config: LoadedConfig): LoadedConfig {
  const {
    raw,
    context: { root, configFile = root },
  } = config;

  validate(configSchema.schema, raw, configFile);

  return config;
}
