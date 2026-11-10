import { filter, flatMap, map } from "@auaust/primitive-kit/arrays";
import { isString } from "@auaust/toolkit/isString";

import { fixedOptions } from "#tools/prettier/constants";
import { createLayoutPlugin } from "#tools/prettier/plugins/createLayoutPlugin";
import { mapConventions } from "#tools/prettier/utils/mapConventions";
import type { LoadedConfig } from "#project/config/index";
import type { PrettierPlugin } from "#tools/prettier/ports/PrettierPlugin";
import type { Config } from "#tools/prettier/types/Config";
import type { Plugin } from "#tools/prettier/types/Plugin";

import * as layoutConventions from "#tools/prettier/conventions/layout/index";

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

  const contributed = await Promise.all(map(entries, (entry) => entry.load()));

  const plugins = [...(options.plugins ?? []), ...contributed];

  // @debt plugins named by a string or URL are loaded by Prettier, so the layout plugin cannot wrap their parsers and shadows them with Prettier's own
  const loaded = filter(plugins, (plugin): plugin is Plugin => {
    return !isString(plugin) && !(plugin instanceof URL);
  });

  return {
    ...fixedOptions,
    ...mapConventions(conventions),
    ...options,
    plugins: [...plugins, createLayoutPlugin(loaded, layoutConventions)],
    overrides: [...createOverrides(entries), ...(options.overrides ?? [])],
  };
}
