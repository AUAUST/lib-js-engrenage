import { defaultOptions } from "#tools/prettier/constants";
import type { Config } from "#tools/prettier/types/Config";

export function createPrettierConfig(options: Config = {}): Config {
  return {
    ...defaultOptions,
    ...options,
  };
}
