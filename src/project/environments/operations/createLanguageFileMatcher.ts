import { map } from "@auaust/toolkit/array";

import { getFileEnvironment } from "#batiment/environments/index";
import { readEnvironmentLanguages } from "#project/environments/operations/readEnvironmentLanguages";
import type { ConfigResolver } from "#project/config/index";
import type { LanguageFileMatcher } from "#project/environments/types/LanguageFileMatcher";
import type { File } from "#types/File";

/**
 * Matches the files of the language named `language` in the scope `config`
 * resolves: each taking an extension the language has in the environment covering
 * it, as that environment's language options resolve them.
 *
 * @throws When a matched file lies in no environment.
 */
export async function createLanguageFileMatcher(
  config: ConfigResolver,
  language: string,
): Promise<LanguageFileMatcher> {
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
        `${file} lies in no environment, so no language options tell whether it is a ${language} file`,
      );
    }

    return (extensions.get(environment) ?? []).some((extension) => {
      return file.endsWith(extension);
    });
  };
}
