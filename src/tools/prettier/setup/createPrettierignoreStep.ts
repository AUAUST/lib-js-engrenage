import { prettier, prettierignoreFile } from "#constants";
import { ignoreBlocks } from "#git/constants";
// @debt reaches into workflows/cli, a higher layer than tools; the layered registry (#143) removes the upward dependency
import type { Step } from "#cli/types/Step";

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
