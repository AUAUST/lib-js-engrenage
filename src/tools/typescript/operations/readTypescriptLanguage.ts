import { typescript } from "#tools/typescript/constants";
import type { LoadedConfig } from "#project/config/index";
import type { LanguageEntry } from "#project/environments/index";

// @debt Repeats the language lookup of `readAliasedLanguage` in `src/project/structure/config/sections/aliasesSection.ts`; one shared lookup on the environments surface would own it.
export async function readTypescriptLanguage(
  config: LoadedConfig,
): Promise<LanguageEntry> {
  const contributions = await config.context.registry.contributions(
    "languages",
    config,
  );

  const language = contributions.find(({ entry }) => {
    return entry.name === typescript;
  });

  if (language === undefined) {
    throw new Error(
      `Bundled imports target the ${typescript} language, which no active extension contributes`,
    );
  }

  return language.entry;
}
