import { isString } from "@auaust/toolkit";
import { map, toDeduplicated } from "@auaust/toolkit/array";
import { freeze, keys } from "@auaust/toolkit/object";

import type { LanguageChoice } from "#batiment/environments/index";
import type { ConfigResolver } from "#project/config/index";
import type { LanguageEntry } from "#project/environments/ports/LanguageEntry";
import type { EnvironmentLanguage } from "#project/environments/types/EnvironmentLanguage";

async function configureExtensions(
  language: LanguageEntry,
  options: Readonly<Record<string, unknown>>,
  subject: string,
): Promise<readonly string[]> {
  if (language.configure === undefined) {
    if (keys(options).length > 0) {
      throw new Error(
        `${subject} selects the language ${language.name} with options, which it takes none of`,
      );
    }

    return language.extensions;
  }

  const configure = await language.configure();

  return toDeduplicated([...language.extensions, ...configure(options)]);
}

/**
 * Resolves the languages `subject` selects against the active `languages`
 * contributions, each with the extensions its options give.
 *
 * @throws When a choice names a language no active extension contributes, or
 * holds options the language rejects.
 */
export async function selectLanguages(
  config: ConfigResolver,
  choices: readonly LanguageChoice[],
  subject: string,
): Promise<readonly EnvironmentLanguage[]> {
  const contributions = await config.context.registry.contributions(
    "languages",
    config,
  );

  const byName = new Map(
    map(contributions, ({ entry }) => [entry.name, entry] as const),
  );

  const selected = await Promise.all(
    map(choices, async (choice) => {
      const {
        name,
        options = {},
      } = isString(choice) ? { name: choice } : choice;

      const language = byName.get(name);

      if (language === undefined) {
        throw new Error(
          `${subject} selects the language ${name}, which no active extension contributes`,
        );
      }

      return freeze({
        ...language,
        extensions: await configureExtensions(language, options, subject),
        options,
      });
    }),
  );

  return freeze(selected);
}
