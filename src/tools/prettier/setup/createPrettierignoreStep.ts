import { prettier, prettierignoreFile } from "#constants";
import { hasConfigFile, type Step } from "#project/steps/index";
import { ignoreBlocks } from "#tools/git/constants";
import type { ResolvedPrettier } from "#tools/prettier/types/ResolvedPrettier";

export function createPrettierignoreStep(): Step<{
  prettier: ResolvedPrettier;
}> {
  return {
    name: prettierignoreFile,
    message: `Create ${prettierignoreFile}?`,
    isMissing({ get, filesystem, readPackageJson }) {
      return (
        get("prettier").prettierignore === undefined &&
        (hasConfigFile(filesystem, prettier) ||
          readPackageJson([prettier]) !== undefined) &&
        !filesystem.exists(prettierignoreFile)
      );
    },
    plan({ filesystem }) {
      filesystem.write(prettierignoreFile, ignoreBlocks);
    },
  };
}
