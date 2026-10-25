import { prettierOptions } from "#prettier/config/defaults/prettierOptions";
import type { Config } from "#prettier/types/Config";

export function createPrettierConfig(options: Config = {}): Config {
  return {
    ...prettierOptions,
    ...options,
  };
}
