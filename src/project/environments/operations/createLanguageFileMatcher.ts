import { getFileEnvironment } from "#batiment/environments/index";
import { readLanguageExtensions } from "#project/environments/operations/readLanguageExtensions";
import type { ConfigResolver } from "#project/config/index";
import type { LanguageFileMatcher } from "#project/environments/types/LanguageFileMatcher";
import type { File } from "#types/File";

/**
 * Matches the files of the language named `language` in the scope `config`
 * resolves: each taking an extension the language has in the environment covering
 * it, as `readLanguageExtensions` reads them.
 *
 * @throws When a matched file lies in no environment.
 */
export async function createLanguageFileMatcher(
  config: ConfigResolver,
  language: string,
): Promise<LanguageFileMatcher> {
  const [context, extensions] = await Promise.all([
    config.resolve("structure.context"),
    readLanguageExtensions(config, language),
  ]);

  const { environments } = await context.discover();

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
