import { fixedOptions } from "#tools/prettier/constants";
import { mapConventions } from "#tools/prettier/utils/mapConventions";
import type { OptionContext } from "#foundation/options/types/OptionContext";
import type { Conventions } from "#project/format/types/Conventions";
import type { Config } from "#tools/prettier/types/Config";

export function createPrettierConfig(
  { get }: OptionContext<{ format: Conventions }>,
  options: Config = {},
): Config {
  return {
    ...fixedOptions,
    ...mapConventions(get("format")),
    ...options,
  };
}
