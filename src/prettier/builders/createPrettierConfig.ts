import { prettierOptions } from "#config/prettier/prettierOptions";
import type { Config } from "#prettier/types/Config";

export function createPrettierConfig(options: Config = {}): Config {
  return {
    ...prettierOptions,
    ...options,
  };
}
