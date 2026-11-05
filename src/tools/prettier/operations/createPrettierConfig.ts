import { fixedOptions } from "#tools/prettier/constants";
import { mapConventions } from "#tools/prettier/utils/mapConventions";
import type { OptionContext } from "#foundation/options/index";
import type { Conventions } from "#project/format/index";
import type { Config } from "#tools/prettier/types/Config";

export async function createPrettierConfig(
  { get }: OptionContext<{ format: Conventions }>,
  options: Config = {},
): Promise<Config> {
  return {
    ...fixedOptions,
    ...mapConventions(await get("format")),
    ...options,
  };
}
