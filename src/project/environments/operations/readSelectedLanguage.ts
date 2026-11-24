import { readSelectedLanguages } from "#project/environments/operations/readSelectedLanguages";
import type { ConfigResolver } from "#project/config/index";
import type { LanguageEntry } from "#project/environments/ports/LanguageEntry";

/**
 * Reads the language named `name` as `readSelectedLanguages` gives it; `undefined`
 * when no registered environment selects it.
 */
export async function readSelectedLanguage(
  config: ConfigResolver,
  name: string,
): Promise<LanguageEntry | undefined> {
  const languages = await readSelectedLanguages(config);

  return languages.find((candidate) => candidate.name === name);
}
