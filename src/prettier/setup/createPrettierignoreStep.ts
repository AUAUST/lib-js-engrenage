import { prettier, prettierignoreFile } from "#constants";
import { ignoreBlocks } from "#git/constants";
import type { Step } from "#support/scaffold/types/Step";

export function createPrettierignoreStep(): Step {
  return {
    name: prettierignoreFile,
    message: `Create ${prettierignoreFile}?`,
    isMissing({ config, files, readPackageJson }) {
      return (
        config.prettierignorePath === undefined &&
        readPackageJson([prettier]) !== undefined &&
        !files.exists(prettierignoreFile)
      );
    },
    plan({ files }) {
      files.write(prettierignoreFile, ignoreBlocks);
    },
  };
}
