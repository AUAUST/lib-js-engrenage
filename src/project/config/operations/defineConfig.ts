import type { ConfigInput } from "#project/config/types/ConfigInput";
import type { Resolvable } from "#types/Resolvable";

export function defineConfig(
  config: Resolvable<ConfigInput>,
): Resolvable<ConfigInput> {
  return config;
}
