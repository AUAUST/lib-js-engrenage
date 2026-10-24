import { prettierOptions } from "#prettier/presets/prettierOptions";
import type { Config } from "#prettier/types/Config";

export function createPrettierConfig(options: Config = {}): Config {
  return {
    ...prettierOptions,
    ...options,
  };
}
