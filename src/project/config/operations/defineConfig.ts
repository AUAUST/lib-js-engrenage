import type { Config } from "#config/types/Config";
import type { ConfigInput } from "#types/ConfigInput";

export function defineConfig(config: ConfigInput<Config>): ConfigInput<Config> {
  return config;
}
