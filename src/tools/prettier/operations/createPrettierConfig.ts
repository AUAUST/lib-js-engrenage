import { fixedOptions } from "#tools/prettier/constants";
import { mapConventions } from "#tools/prettier/utils/mapConventions";
import type { LoadedConfig } from "#project/config/index";
import type { Config } from "#tools/prettier/types/Config";

export async function createPrettierConfig(
  { resolve }: LoadedConfig,
  options: Config = {},
): Promise<Config> {
  return {
    ...fixedOptions,
    ...mapConventions(await resolve("format")),
    ...options,
  };
}
