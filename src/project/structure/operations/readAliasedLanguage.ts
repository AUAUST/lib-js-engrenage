import type { ConfigResolver } from "#project/config/index";
import type { LanguageEntry } from "#project/environments/index";

const aliasedLanguage = "typescript";

// @debt aliases target the language named typescript, so a project without that language, or written in another one, gets no alias
export async function readAliasedLanguage(
  config: ConfigResolver,
): Promise<LanguageEntry> {
  const contributions = await config.context.registry.contributions(
    "languages",
    config,
  );

  const language = contributions.find(({ entry }) => {
    return entry.name === aliasedLanguage;
  });

  if (language === undefined) {
    throw new Error(
      `Aliases target the ${aliasedLanguage} language, which no active extension contributes`,
    );
  }

  return language.entry;
}
