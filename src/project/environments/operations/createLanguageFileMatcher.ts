import { createLanguageExtensions } from "#project/environments/operations/createLanguageExtensions";
import { findFileExtension } from "#project/environments/utils/findFileExtension";
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
  const extensionsOf = await createLanguageExtensions(config, language);

  return (file: File) => {
    return findFileExtension(file, extensionsOf(file)) !== undefined;
  };
}
