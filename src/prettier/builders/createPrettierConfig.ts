import { defaultOptions } from "#prettier/constants";
import type { Config } from "#prettier/types/Config";

export function createPrettierConfig(options: Config = {}): Config {
  return {
    ...defaultOptions,
    ...options,
  };
}
