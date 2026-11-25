import { map } from "@auaust/toolkit/array";

import { getFileEnvironment } from "#batiment/environments/index";
import { readEnvironmentLanguages } from "#project/environments/operations/readEnvironmentLanguages";
import type { ConfigResolver } from "#project/config/index";
import type { LanguageExtensions } from "#project/environments/types/LanguageExtensions";
import type { File } from "#types/File";

/**
 * Reads the extensions the language named `language` has in each environment of
 * the scope `config` resolves, as that environment's language options resolve
 * them, looked up by the environment covering a file.
 */
export async function createLanguageExtensions(
  config: ConfigResolver,
  language: string,
): Promise<LanguageExtensions> {
  const context = await config.resolve("structure.context");

  const { environments } = await context.discover();

  const registered = environments.registered.filter(({ scope }) => {
    return scope === config.context.scopeDir;
  });

  const selected = await Promise.all(
    map(registered, async ({ registration: { name } }) => {
      const languages = await readEnvironmentLanguages(config, name);

      const entry = languages.find((candidate) => candidate.name === language);

      return [name, entry?.extensions ?? []] as const;
    }),
  );

  const extensions = new Map(selected);

  return (file: File) => {
    const environment = getFileEnvironment(environments.placements, file);

    if (environment === undefined) {
      throw new Error(
        `${file} lies in no environment, so no language options give its ${language} extensions`,
      );
    }

    return extensions.get(environment) ?? [];
  };
}
