import { flatMap, map } from "@auaust/primitive-kit/arrays";

import { fixedOptions } from "#tools/prettier/constants";
import { mapConventions } from "#tools/prettier/utils/mapConventions";
import type { LoadedConfig } from "#project/config/index";
import type { PrettierPlugin } from "#tools/prettier/ports/PrettierPlugin";
import type { Config } from "#tools/prettier/types/Config";

function createOverrides(
  plugins: readonly PrettierPlugin[],
): NonNullable<Config["overrides"]> {
  return flatMap(plugins, ({ files, options }) => {
    if (files === undefined) {
      return [];
    }

    return options === undefined
      ? [{ files: [...files] }]
      : [{ files: [...files], options }];
  });
}

export async function createPrettierConfig(
  config: LoadedConfig,
  options: Config = {},
): Promise<Config> {
  const [conventions, contributions] = await Promise.all([
    config.resolve("format"),
    config.context.registry.contributions("prettier.plugins", config),
  ]);

  const entries = map(contributions, ({ entry }) => entry);

  const plugins = await Promise.all(map(entries, (entry) => entry.load()));

  return {
    ...fixedOptions,
    ...mapConventions(conventions),
    ...options,
    plugins: [...(options.plugins ?? []), ...plugins],
    overrides: [...createOverrides(entries), ...(options.overrides ?? [])],
  };
}
