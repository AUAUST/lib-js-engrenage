import { prettier, prettierignoreFile } from "#constants";
import { ignoreBlocks } from "#tools/git/constants";
import type { Step } from "#project/steps/types/Step";
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
        readPackageJson([prettier]) !== undefined &&
        !filesystem.exists(prettierignoreFile)
      );
    },
    plan({ filesystem }) {
      filesystem.write(prettierignoreFile, ignoreBlocks);
    },
  };
}
