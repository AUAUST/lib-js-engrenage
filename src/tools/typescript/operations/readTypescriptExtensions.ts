import { tsx, typescript } from "#tools/typescript/constants";
import type { LoadedConfig } from "#project/config/index";

// @debt Repeats the language lookup of `readAliasedLanguage` in `src/project/structure/config/sections/aliasesSection.ts` and of `readTypescriptFiles` in `src/tools/eslint/operations/createEslintConfig.ts`; one shared lookup on the environments surface would own it.
export async function readTypescriptExtensions(
  config: LoadedConfig,
): Promise<readonly string[]> {
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

  const tsxLanguage = contributions.find(({ entry }) => entry.name === tsx);

  return [
    ...language.entry.extensions,
    ...(tsxLanguage?.entry.extensions ?? []),
  ];
}
