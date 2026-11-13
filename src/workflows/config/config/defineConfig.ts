import type { Resolvable } from "#types/Resolvable";
import type { ConfigInput } from "#workflows/config/types/ConfigInput";

/**
 * Returns `config` unchanged, typing the project's configuration; a function
 * computes it when the configuration loads.
 */
export function defineConfig(
  config: Resolvable<ConfigInput>,
): Resolvable<ConfigInput> {
  return config;
}
