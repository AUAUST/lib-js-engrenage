import { withExtensions } from "#foundation/filesystem/index";
import type { LanguageEntry } from "#project/environments/ports/LanguageEntry";
import type { Globs } from "#types/Globs";

export function listLanguageFiles(languages: readonly LanguageEntry[]): Globs {
  return languages.map((language) => {
    return withExtensions("**/*", language.extensions);
  });
}
