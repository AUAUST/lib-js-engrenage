import type { Resolvable } from "#types/Resolvable";
import type { ConfigInput } from "#workflows/config/types/ConfigInput";

export function defineConfig(
  config: Resolvable<ConfigInput>,
): Resolvable<ConfigInput> {
  return config;
}
