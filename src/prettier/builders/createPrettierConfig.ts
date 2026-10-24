import { prettierOptions } from "#prettier/presets/prettierOptions";
import type { Config } from "prettier";

export function createPrettierConfig(options: Config = {}): Config {
  return {
    ...prettierOptions,
    ...options,
  };
}
