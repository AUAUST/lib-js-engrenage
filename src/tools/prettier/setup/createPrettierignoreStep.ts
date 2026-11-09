import { prettier, prettierignoreFile } from "#constants";
import { hasConfigFile, type Step } from "#project/steps/index";
import { ignoreBlocks } from "#tools/git/constants";

export function createPrettierignoreStep(): Step {
  return {
    name: prettierignoreFile,
    message: `Create ${prettierignoreFile}?`,
    async isMissing({ resolve, filesystem, readPackageJson }) {
      const resolved = await resolve("prettier");

      return (
        (await resolved.prettierignore) === undefined &&
        ((await hasConfigFile(filesystem, prettier)) ||
          (await readPackageJson([prettier])) !== undefined) &&
        !(await filesystem.exists(prettierignoreFile))
      );
    },
    async plan({ filesystem }) {
      await filesystem.write(prettierignoreFile, ignoreBlocks);
    },
  };
}
