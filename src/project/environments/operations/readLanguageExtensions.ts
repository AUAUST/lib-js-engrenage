import { map } from "@auaust/toolkit/array";

import { readEnvironmentLanguages } from "#project/environments/operations/readEnvironmentLanguages";
import type { ConfigResolver } from "#project/config/index";

/**
 * The extensions the language named `language` takes in each environment
 * registered in the scope `config` resolves, by environment name, as the
 * environment's language options resolve them; none where it is not selected.
 */
export async function readLanguageExtensions(
  config: ConfigResolver,
  language: string,
): Promise<ReadonlyMap<string, readonly string[]>> {
  const context = await config.resolve("structure.context");

  const { environments } = await context.discover();

  const registered = environments.registered.filter(({ scope }) => {
    return scope === config.context.scopeDir;
  });

  const extensions = await Promise.all(
    map(registered, async ({ registration: { name } }) => {
      const languages = await readEnvironmentLanguages(config, name);

      const selected = languages.find((entry) => entry.name === language);

      return [name, selected?.extensions ?? []] as const;
    }),
  );

  return new Map(extensions);
}
