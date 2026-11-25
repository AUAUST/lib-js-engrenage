import { createLanguageFileMatcher } from "#project/environments/index";
import { declarationExtension, typescript } from "#tools/typescript/constants";
import type { ConfigResolver } from "#project/config/index";
import type { ModuleMatcher } from "#tools/typescript/types/ModuleMatcher";
import type { File } from "#types/File";

/**
 * Matches the TypeScript modules of the scope `config` resolves: its TypeScript
 * files, but declarations.
 *
 * @throws When a matched file lies in no environment.
 */
export async function createModuleMatcher(
  config: ConfigResolver,
): Promise<ModuleMatcher> {
  const isTypescriptFile = await createLanguageFileMatcher(config, typescript);

  return (file: File) => {
    return !file.endsWith(declarationExtension) && isTypescriptFile(file);
  };
}
