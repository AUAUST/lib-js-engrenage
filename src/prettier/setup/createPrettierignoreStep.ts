import { prettier, prettierignoreFile } from "#constants";
import { ignoreBlocks } from "#git/constants";
import type { Step } from "#support/scaffold/types/Step";

export function createPrettierignoreStep(): Step {
  return {
    name: prettierignoreFile,
    message: `Create ${prettierignoreFile}?`,
    isMissing({ config, filesystem, readPackageJson }) {
      return (
        config.prettier.prettierignore === undefined &&
        readPackageJson([prettier]) !== undefined &&
        !filesystem.exists(prettierignoreFile)
      );
    },
    plan({ filesystem }) {
      filesystem.write(prettierignoreFile, ignoreBlocks);
    },
  };
}
